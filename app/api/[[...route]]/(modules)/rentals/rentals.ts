import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {zValidator} from "@hono/zod-validator";
import {createId} from "@paralleldrive/cuid2";
import {eq, and, desc} from "drizzle-orm";
import {Hono} from "hono";
import {z} from "zod";

import {db} from "@/db/drizzle";
import {rentals, users, cars, drivers} from "@/db/schema";

// Rental creation schema
const createRentalSchema = z
    .object({
        carId: z.string().min(1, "Car ID is required"),
        driverId: z.string().optional().nullable(),
        startDate: z.string().datetime("Invalid start date"),
        endDate: z.string().datetime("Invalid end date"),
        pickupLocation: z.string().min(1, "Pickup location is required"),
        dropoffLocation: z.string().min(1, "Dropoff location is required"),
        totalCost: z.number().positive("Total cost must be positive"),
    })
    .refine(
        (data) => {
            const start = new Date(data.startDate);
            const end = new Date(data.endDate);
            return start < end;
        },
        {
            message: "End date must be after start date",
            path: ["endDate"],
        },
    );

// Update rental schema
const updateRentalSchema = z.object({
    id: z.string().min(1, "Rental ID is required"),
    status: z.enum(["pending", "active", "completed", "cancelled"]),
    driverId: z.string().optional().nullable(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    totalCost: z.number().positive().optional(),
});

// Helper function to check if user is admin
const checkAdminAccess = async (auth: any) => {
    if (!auth?.userId) {
        return {isAdmin: false, user: null};
    }

    const user = await db.query.users.findFirst({
        where: eq(users.clerk_id, auth.userId),
    });

    if (!user) {
        return {isAdmin: false, user: null};
    }

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    return {isAdmin, user};
};

const app = new Hono()
    // GET all rentals for admin
    .get("/admin/all", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        const {isAdmin} = await checkAdminAccess(auth);

        if (!isAdmin) {
            return c.json(
                {success: false, message: "Admin access required"},
                403,
            );
        }

        const allRentals = await db.query.rentals.findMany({
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
                        images: true,
                        pricePerDay: true,
                        pricePerKm: true,
                    },
                },
                driver: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [desc(rentals.createdAt)],
        });

        return c.json({success: true, data: allRentals});
    })

    // GET all rentals for authenticated user
    .get("/", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized"}, 401);
        }

        const user = await db.query.users.findFirst({
            where: eq(users.clerk_id, auth.userId),
        });

        if (!user) {
            return c.json({success: false, message: "User not found"}, 404);
        }

        const userRentals = await db.query.rentals.findMany({
            where: eq(rentals.userId, user.id),
            with: {
                car: {
                    columns: {
                        id: true,
                        name: true,
                        make: true,
                        model: true,
                        images: true,
                        pricePerDay: true,
                        pricePerKm: true,
                    },
                },
                driver: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [desc(rentals.createdAt)],
        });

        return c.json({success: true, data: userRentals});
    })

    // GET rental by ID
    .get("/:id", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized"}, 401);
        }

        const {id} = c.req.param();

        const rental = await db.query.rentals.findFirst({
            where: eq(rentals.id, id),
            with: {
                user: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                car: true,
                driver: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!rental) {
            return c.json({success: false, message: "Rental not found"}, 404);
        }

        return c.json({success: true, data: rental});
    })

    // POST create new rental
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", createRentalSchema),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json({success: false, message: "Unauthorized"}, 401);
            }

            const body = c.req.valid("json");

            // Get user
            const user = await db.query.users.findFirst({
                where: eq(users.clerk_id, auth.userId),
            });

            if (!user) {
                return c.json({success: false, message: "User not found"}, 404);
            }

            // Check if car exists and is available
            const car = await db.query.cars.findFirst({
                where: eq(cars.id, body.carId),
            });

            if (!car) {
                return c.json({success: false, message: "Car not found"}, 404);
            }

            if (!car.isAvailable) {
                return c.json(
                    {success: false, message: "Car is not available"},
                    400,
                );
            }

            // Check if driver exists (if provided)
            if (body.driverId) {
                const driver = await db.query.drivers.findFirst({
                    where: and(
                        eq(drivers.id, body.driverId),
                        eq(drivers.isActive, true),
                    ),
                });

                if (!driver) {
                    return c.json(
                        {
                            success: false,
                            message: "Driver not found or inactive",
                        },
                        404,
                    );
                }
            }

            try {
                const rentalId = createId();

                const [rental] = await db
                    .insert(rentals)
                    .values({
                        id: rentalId,
                        userId: user.id,
                        carId: body.carId,
                        driverId: body.driverId,
                        startDate: new Date(body.startDate),
                        endDate: new Date(body.endDate),
                        pickupLocation: body.pickupLocation,
                        dropoffLocation: body.dropoffLocation,
                        totalCost: body.totalCost.toString(),
                        status: "pending",
                    })
                    .returning();

                // Get the complete rental with relations
                const completeRental = await db.query.rentals.findFirst({
                    where: eq(rentals.id, rental.id),
                    with: {
                        car: {
                            columns: {
                                id: true,
                                name: true,
                                make: true,
                                model: true,
                                images: true,
                            },
                        },
                        driver: {
                            columns: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                });

                return c.json({success: true, data: completeRental}, 201);
            } catch (error) {
                console.error("Error creating rental:", error);
                return c.json(
                    {success: false, message: "Failed to create rental"},
                    500,
                );
            }
        },
    )

    // PUT update rental
    .put(
        "/",
        clerkMiddleware(),
        zValidator("json", updateRentalSchema),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json({success: false, message: "Unauthorized"}, 401);
            }

            const body = c.req.valid("json");

            // Check if rental exists
            const existingRental = await db.query.rentals.findFirst({
                where: eq(rentals.id, body.id),
            });

            if (!existingRental) {
                return c.json(
                    {success: false, message: "Rental not found"},
                    404,
                );
            }

            try {
                const updateData: any = {
                    status: body.status,
                };

                if (body.driverId !== undefined)
                    updateData.driverId = body.driverId;
                if (body.startDate)
                    updateData.startDate = new Date(body.startDate);
                if (body.endDate) updateData.endDate = new Date(body.endDate);
                if (body.pickupLocation)
                    updateData.pickupLocation = body.pickupLocation;
                if (body.dropoffLocation)
                    updateData.dropoffLocation = body.dropoffLocation;
                if (body.totalCost)
                    updateData.totalCost = body.totalCost.toString();

                const [updatedRental] = await db
                    .update(rentals)
                    .set(updateData)
                    .where(eq(rentals.id, body.id))
                    .returning();

                return c.json({success: true, data: updatedRental});
            } catch (error) {
                console.error("Error updating rental:", error);
                return c.json(
                    {success: false, message: "Failed to update rental"},
                    500,
                );
            }
        },
    )

    // DELETE rental
    .delete("/:id", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized"}, 401);
        }

        const {id} = c.req.param();

        const existingRental = await db.query.rentals.findFirst({
            where: eq(rentals.id, id),
        });

        if (!existingRental) {
            return c.json({success: false, message: "Rental not found"}, 404);
        }

        try {
            await db.delete(rentals).where(eq(rentals.id, id));
            return c.json({
                success: true,
                message: "Rental deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting rental:", error);
            return c.json(
                {success: false, message: "Failed to delete rental"},
                500,
            );
        }
    });

export default app;
