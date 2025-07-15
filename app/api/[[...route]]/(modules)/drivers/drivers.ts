import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {zValidator} from "@hono/zod-validator";
import {createId} from "@paralleldrive/cuid2";
import {eq, and} from "drizzle-orm";
import {Hono} from "hono";
import {z} from "zod";

import {db} from "@/db/drizzle";
import {drivers, users, cars} from "@/db/schema";

// Driver schemas
const createDriverSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    licenseNumber: z.string().min(1, "License number is required"),
    carId: z.string().optional(),
});

const updateDriverSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Valid email is required"),
    licenseNumber: z.string().min(1, "License number is required"),
    carId: z.string().optional(),
    isActive: z.boolean().optional(),
    isApproved: z.boolean().optional(),
});

const app = new Hono()
    // GET all drivers
    .get("/", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized user"}, 401);
        }

        const fetchedDrivers = await db.query.drivers.findMany({
            with: {
                user: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                car: {
                    columns: {
                        id: true,
                        name: true,
                        make: true,
                        model: true,
                    },
                },
            },
        });

        return c.json({success: true, data: fetchedDrivers}, 200);
    })

    // GET pending drivers (for approvals)
    .get("/pending", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized user"}, 401);
        }

        const pendingDrivers = await db.query.drivers.findMany({
            where: eq(drivers.isApproved, false),
            with: {
                user: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                car: {
                    columns: {
                        id: true,
                        name: true,
                        make: true,
                        model: true,
                    },
                },
            },
        });

        return c.json({success: true, data: pendingDrivers}, 200);
    })

    // GET driver by ID
    .get(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string()})),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json(
                    {success: false, message: "Unauthorized user"},
                    401,
                );
            }

            const {id} = c.req.valid("param");
            const driver = await db.query.drivers.findFirst({
                where: eq(drivers.id, id),
                with: {
                    user: {
                        columns: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    car: {
                        columns: {
                            id: true,
                            name: true,
                            make: true,
                            model: true,
                        },
                    },
                },
            });

            if (!driver) {
                return c.json(
                    {success: false, message: "Driver not found"},
                    404,
                );
            }

            return c.json({success: true, data: driver}, 200);
        },
    )

    // CREATE new driver
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", createDriverSchema),
        async (c) => {
            try {
                const auth = getAuth(c);
                if (!auth?.userId) {
                    return c.json(
                        {success: false, message: "Unauthorized user"},
                        401,
                    );
                }

                const body = c.req.valid("json");

                // Check if email already exists
                const existingDriver = await db.query.drivers.findFirst({
                    where: eq(drivers.email, body.email),
                });

                if (existingDriver) {
                    return c.json(
                        {success: false, message: "Email already exists"},
                        400,
                    );
                }

                // Check if license number already exists
                const existingLicense = await db.query.drivers.findFirst({
                    where: eq(drivers.licenseNumber, body.licenseNumber),
                });

                if (existingLicense) {
                    return c.json(
                        {
                            success: false,
                            message: "License number already exists",
                        },
                        400,
                    );
                }

                const values = {
                    id: createId(),
                    ...body,
                    userId: null, // Admin created driver, no associated user initially
                };

                const [driver] = await db
                    .insert(drivers)
                    .values(values)
                    .returning();

                return c.json({success: true, data: driver}, 201);
            } catch (error) {
                console.error("Error creating driver:", error);
                return c.json(
                    {success: false, message: "Internal server error"},
                    500,
                );
            }
        },
    )

    // UPDATE driver
    .put(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string()})),
        zValidator("json", updateDriverSchema),
        async (c) => {
            try {
                const auth = getAuth(c);
                if (!auth?.userId) {
                    return c.json(
                        {success: false, message: "Unauthorized user"},
                        401,
                    );
                }

                const {id} = c.req.valid("param");
                const body = c.req.valid("json");

                // Check if driver exists
                const existingDriver = await db.query.drivers.findFirst({
                    where: eq(drivers.id, id),
                });

                if (!existingDriver) {
                    return c.json(
                        {success: false, message: "Driver not found"},
                        404,
                    );
                }

                // Check if email already exists for another driver
                if (body.email !== existingDriver.email) {
                    const emailExists = await db.query.drivers.findFirst({
                        where: and(
                            eq(drivers.email, body.email),
                            eq(drivers.id, id),
                        ),
                    });

                    if (emailExists && emailExists.id !== id) {
                        return c.json(
                            {success: false, message: "Email already exists"},
                            400,
                        );
                    }
                }

                const [updatedDriver] = await db
                    .update(drivers)
                    .set({
                        ...body,
                        updatedAt: new Date(),
                    })
                    .where(eq(drivers.id, id))
                    .returning();

                return c.json({success: true, data: updatedDriver}, 200);
            } catch (error) {
                console.error("Error updating driver:", error);
                return c.json(
                    {success: false, message: "Internal server error"},
                    500,
                );
            }
        },
    )

    // APPROVE/REJECT driver
    .patch(
        "/:id/status",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string()})),
        zValidator("json", z.object({isApproved: z.boolean()})),
        async (c) => {
            try {
                const auth = getAuth(c);
                if (!auth?.userId) {
                    return c.json(
                        {success: false, message: "Unauthorized user"},
                        401,
                    );
                }

                const {id} = c.req.valid("param");
                const {isApproved} = c.req.valid("json");

                const [updatedDriver] = await db
                    .update(drivers)
                    .set({
                        isApproved,
                        updatedAt: new Date(),
                    })
                    .where(eq(drivers.id, id))
                    .returning();

                if (!updatedDriver) {
                    return c.json(
                        {success: false, message: "Driver not found"},
                        404,
                    );
                }

                return c.json(
                    {
                        success: true,
                        data: updatedDriver,
                        message: `Driver ${isApproved ? "approved" : "rejected"} successfully`,
                    },
                    200,
                );
            } catch (error) {
                console.error("Error updating driver status:", error);
                return c.json(
                    {success: false, message: "Internal server error"},
                    500,
                );
            }
        },
    )

    // DELETE driver
    .delete(
        "/:id",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string()})),
        async (c) => {
            try {
                const auth = getAuth(c);
                if (!auth?.userId) {
                    return c.json(
                        {success: false, message: "Unauthorized user"},
                        401,
                    );
                }

                const {id} = c.req.valid("param");

                const [deletedDriver] = await db
                    .delete(drivers)
                    .where(eq(drivers.id, id))
                    .returning();

                if (!deletedDriver) {
                    return c.json(
                        {success: false, message: "Driver not found"},
                        404,
                    );
                }

                return c.json(
                    {success: true, message: "Driver deleted successfully"},
                    200,
                );
            } catch (error) {
                console.error("Error deleting driver:", error);
                return c.json(
                    {success: false, message: "Internal server error"},
                    500,
                );
            }
        },
    );

export default app;
