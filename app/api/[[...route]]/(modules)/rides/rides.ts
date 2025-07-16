import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {zValidator} from "@hono/zod-validator";
import {createId} from "@paralleldrive/cuid2";
import {eq, and, desc} from "drizzle-orm";
import {Hono} from "hono";
import {z} from "zod";

import {db} from "@/db/drizzle";
import {rides, users, cars, drivers} from "@/db/schema";

// Helper function to check admin access
async function checkAdminAccess(auth: any) {
    if (!auth?.userId) {
        return {isAdmin: false, currentUser: null};
    }

    const currentUser = await db.query.users.findFirst({
        where: eq(users.clerk_id, auth.userId),
    });

    const isAdmin =
        currentUser?.role === "admin" || currentUser?.role === "super_admin";

    return {isAdmin, currentUser};
}

// Ride creation schema
const createRideSchema = z.object({
    carId: z.string().min(1, "Car ID is required"),
    driverId: z.string().optional().nullable(),
    pickupTime: z.string().datetime("Invalid pickup time"),
    pickupLocation: z.string().min(1, "Pickup location is required"),
    dropoffLocation: z.string().min(1, "Dropoff location is required"),
    estimatedDistance: z.number().positive("Distance must be positive"),
    estimatedDuration: z.number().positive("Duration must be positive"),
    totalCost: z.number().positive("Total cost must be positive"),
    passengerCount: z.number().int().min(1).max(8).default(1),
    notes: z.string().optional(),
});

// Update ride schema
const updateRideSchema = z.object({
    id: z.string().min(1, "Ride ID is required"),
    status: z.enum(["pending", "active", "completed", "cancelled"]),
    driverId: z.string().optional().nullable(),
    pickupTime: z.string().datetime().optional(),
    dropoffTime: z.string().datetime().optional(),
    pickupLocation: z.string().optional(),
    dropoffLocation: z.string().optional(),
    estimatedDistance: z.number().positive().optional(),
    estimatedDuration: z.number().positive().optional(),
    totalCost: z.number().positive().optional(),
    passengerCount: z.number().int().min(1).max(8).optional(),
    notes: z.string().optional(),
});

const app = new Hono()
    // GET all rides for admin
    .get("/admin/all", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        const {isAdmin} = await checkAdminAccess(auth);

        if (!isAdmin) {
            return c.json(
                {success: false, message: "Admin access required"},
                403,
            );
        }

        const allRides = await db.query.rides.findMany({
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
            orderBy: [desc(rides.createdAt)],
        });

        return c.json({success: true, data: allRides});
    })

    // GET all rides for authenticated user
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

        const userRides = await db.query.rides.findMany({
            where: eq(rides.userId, user.id),
            with: {
                car: {
                    columns: {
                        id: true,
                        name: true,
                        make: true,
                        model: true,
                        images: true,
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
            orderBy: [desc(rides.createdAt)],
        });

        return c.json({success: true, data: userRides});
    })

    // GET pending rides (for approvals)
    .get("/pending", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized user"}, 401);
        }

        // Check admin access
        const {isAdmin} = await checkAdminAccess(auth);
        if (!isAdmin) {
            return c.json(
                {success: false, message: "Insufficient permissions"},
                403,
            );
        }

        const pendingRides = await db.query.rides.findMany({
            where: eq(rides.status, "pending"),
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
            orderBy: (rides, {desc}) => [desc(rides.createdAt)],
        });

        return c.json({success: true, data: pendingRides}, 200);
    })

    // GET ride by ID
    .get("/:id", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized"}, 401);
        }

        const {id} = c.req.param();

        const ride = await db.query.rides.findFirst({
            where: eq(rides.id, id),
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

        if (!ride) {
            return c.json({success: false, message: "Ride not found"}, 404);
        }

        return c.json({success: true, data: ride});
    })

    // APPROVE/REJECT ride
    .patch(
        "/:id/status",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string()})),
        zValidator("json", z.object({status: z.enum(["active", "cancelled"])})),
        async (c) => {
            try {
                const auth = getAuth(c);
                if (!auth?.userId) {
                    return c.json(
                        {success: false, message: "Unauthorized user"},
                        401,
                    );
                }

                // Check admin access
                const {isAdmin} = await checkAdminAccess(auth);
                if (!isAdmin) {
                    return c.json(
                        {success: false, message: "Insufficient permissions"},
                        403,
                    );
                }

                const {id} = c.req.valid("param");
                const {status} = c.req.valid("json");

                // Check if ride exists and is pending
                const existingRide = await db.query.rides.findFirst({
                    where: eq(rides.id, id),
                });

                if (!existingRide) {
                    return c.json(
                        {success: false, message: "Ride not found"},
                        404,
                    );
                }

                if (existingRide.status !== "pending") {
                    return c.json(
                        {
                            success: false,
                            message: "Ride is not pending approval",
                        },
                        400,
                    );
                }

                const [updatedRide] = await db
                    .update(rides)
                    .set({
                        status,
                        updatedAt: new Date(),
                    })
                    .where(eq(rides.id, id))
                    .returning();

                if (!updatedRide) {
                    return c.json(
                        {success: false, message: "Ride not found"},
                        404,
                    );
                }

                const actionText =
                    status === "active" ? "approved" : "rejected";
                return c.json(
                    {
                        success: true,
                        data: updatedRide,
                        message: `Ride ${actionText} successfully`,
                    },
                    200,
                );
            } catch (error) {
                console.error("Error updating ride status:", error);
                return c.json(
                    {success: false, message: "Internal server error"},
                    500,
                );
            }
        },
    )

    // POST create new ride
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", createRideSchema),
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

            // Check if car exists and is available for hire
            const car = await db.query.cars.findFirst({
                where: eq(cars.id, body.carId),
            });

            if (!car) {
                return c.json({success: false, message: "Car not found"}, 404);
            }

            if (!car.isAvailable || !car.isForHire) {
                return c.json(
                    {success: false, message: "Car is not available for rides"},
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
                const rideId = createId();

                const [ride] = await db
                    .insert(rides)
                    .values({
                        id: rideId,
                        userId: user.id,
                        carId: body.carId,
                        driverId: body.driverId,
                        pickupTime: new Date(body.pickupTime),
                        pickupLocation: body.pickupLocation,
                        dropoffLocation: body.dropoffLocation,
                        estimatedDistance: body.estimatedDistance.toString(),
                        estimatedDuration: body.estimatedDuration,
                        totalCost: body.totalCost.toString(),
                        passengerCount: body.passengerCount,
                        notes: body.notes,
                        status: "pending",
                    })
                    .returning();

                // Get the complete ride with relations
                const completeRide = await db.query.rides.findFirst({
                    where: eq(rides.id, ride.id),
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

                return c.json({success: true, data: completeRide}, 201);
            } catch (error) {
                console.error("Error creating ride:", error);
                return c.json(
                    {success: false, message: "Failed to create ride"},
                    500,
                );
            }
        },
    )

    // PUT update ride
    .put(
        "/",
        clerkMiddleware(),
        zValidator("json", updateRideSchema),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json({success: false, message: "Unauthorized"}, 401);
            }

            const body = c.req.valid("json");

            // Check if ride exists
            const existingRide = await db.query.rides.findFirst({
                where: eq(rides.id, body.id),
                with: {
                    user: true,
                },
            });

            if (!existingRide) {
                return c.json({success: false, message: "Ride not found"}, 404);
            }

            // Check authorization
            const {isAdmin, currentUser} = await checkAdminAccess(auth);
            const isOwner = existingRide.userId === currentUser?.id;

            if (!isAdmin && !isOwner) {
                return c.json(
                    {success: false, message: "Insufficient permissions"},
                    403,
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
                const updateData: any = {
                    status: body.status,
                };

                // Only include fields that are provided
                if (body.driverId !== undefined)
                    updateData.driverId = body.driverId;
                if (body.pickupTime)
                    updateData.pickupTime = new Date(body.pickupTime);
                if (body.dropoffTime)
                    updateData.dropoffTime = new Date(body.dropoffTime);
                if (body.pickupLocation)
                    updateData.pickupLocation = body.pickupLocation;
                if (body.dropoffLocation)
                    updateData.dropoffLocation = body.dropoffLocation;
                if (body.estimatedDistance)
                    updateData.estimatedDistance =
                        body.estimatedDistance.toString();
                if (body.estimatedDuration)
                    updateData.estimatedDuration = body.estimatedDuration;
                if (body.totalCost)
                    updateData.totalCost = body.totalCost.toString();
                if (body.passengerCount)
                    updateData.passengerCount = body.passengerCount;
                if (body.notes !== undefined) updateData.notes = body.notes;

                const [updatedRide] = await db
                    .update(rides)
                    .set(updateData)
                    .where(eq(rides.id, body.id))
                    .returning();

                // Get complete ride with relations
                const completeRide = await db.query.rides.findFirst({
                    where: eq(rides.id, updatedRide.id),
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

                return c.json({success: true, data: completeRide});
            } catch (error) {
                console.error("Error updating ride:", error);
                return c.json(
                    {success: false, message: "Failed to update ride"},
                    500,
                );
            }
        },
    )

    // DELETE ride
    .delete("/:id", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized"}, 401);
        }

        const {id} = c.req.param();

        // Check if ride exists
        const existingRide = await db.query.rides.findFirst({
            where: eq(rides.id, id),
            with: {
                user: true,
            },
        });

        if (!existingRide) {
            return c.json({success: false, message: "Ride not found"}, 404);
        }

        // Check authorization
        const {isAdmin, currentUser} = await checkAdminAccess(auth);
        const isOwner = existingRide.userId === currentUser?.id;

        if (!isAdmin && !isOwner) {
            return c.json(
                {success: false, message: "Insufficient permissions"},
                403,
            );
        }

        try {
            await db.delete(rides).where(eq(rides.id, id));

            return c.json({
                success: true,
                message: "Ride deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting ride:", error);
            return c.json(
                {success: false, message: "Failed to delete ride"},
                500,
            );
        }
    });

export default app;
