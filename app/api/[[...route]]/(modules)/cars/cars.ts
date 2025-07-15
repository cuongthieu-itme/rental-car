import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {zValidator} from "@hono/zod-validator";
import {createId} from "@paralleldrive/cuid2";
import {eq, inArray, and, or} from "drizzle-orm";
import {Hono} from "hono";
import {z} from "zod";

import {db} from "@/db/drizzle";
import {insertCarSchema, cars, users} from "@/db/schema";

// Create update schema without ZodEffects
const updateCarSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().min(1),
    ownerId: z.string().optional().nullable(),
    make: z.string().min(1),
    model: z.string().min(1),
    mileage: z.number().int(),
    color: z.string().min(1),
    pricePerDay: z.number().int().optional().nullable(),
    pricePerKm: z.number().int().optional().nullable(),
    isForDelivery: z.boolean(),
    isAvailable: z.boolean(),
    isForHire: z.boolean(),
    isForRent: z.boolean(),
    bodyType: z.string().min(1),
    fuelType: z.string().min(1),
    transmission: z.string().min(1),
    driveType: z.string().min(1),
    condition: z.string().min(1),
    engineSize: z.number().int(),
    doors: z.number().int(),
    cylinders: z.number().int(),
    features: z.any().optional(),
    dateManufactured: z.union([z.string(), z.date()]).transform((val) => {
        if (val instanceof Date) {
            return val.toISOString();
        }
        return val;
    }),
    images: z.array(z.string()).min(1, "At least one image is required"),
});

const app = new Hono()
    .get("/", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized user"}, 401);
        }
        const fetchedCars = await db.query.cars.findMany({
            with: {
                owner: {
                    columns: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return c.json({success: true, data: fetchedCars}, 200);
    })
    .get("/list", async (c) => {
        const query = c.req.query();

        const filters = {
            purpose: query.for?.split(",").filter(Boolean) || [],
            colors: query.color?.split(",").filter(Boolean) || [],
            categories: query.category?.split(",").filter(Boolean) || [],
            models: query.model?.split(",").filter(Boolean) || [],
            makes: query.make?.split(",").filter(Boolean) || [],
            fuelTypes: query.fuelType?.split(",").filter(Boolean) || [],
            drivetrains: query.drivetrain?.split(",").filter(Boolean) || [],
            limit: Number(query.limit) || 20,
        };

        const conditions = [];

        if (filters.purpose.length > 0) {
            const purposeConditions = filters.purpose
                .map((purpose) => {
                    switch (purpose.toLowerCase()) {
                        case "hire":
                            return eq(cars.isForHire, true);
                        case "rent":
                            return eq(cars.isForRent, true);
                        case "delivery":
                            return eq(cars.isForDelivery, true);
                    }
                })
                .filter(Boolean);

            if (purposeConditions.length > 0) {
                conditions.push(or(...purposeConditions));
            }
        }

        if (filters.colors.length > 0) {
            conditions.push(inArray(cars.color, filters.colors));
        }

        if (filters.categories.length > 0) {
            conditions.push(inArray(cars.bodyType, filters.categories));
        }

        if (filters.models.length > 0) {
            conditions.push(inArray(cars.model, filters.models));
        }

        if (filters.makes.length > 0) {
            conditions.push(inArray(cars.make, filters.makes));
        }

        if (filters.fuelTypes.length > 0) {
            conditions.push(inArray(cars.fuelType, filters.fuelTypes));
        }

        if (filters.drivetrains.length > 0) {
            conditions.push(inArray(cars.driveType, filters.drivetrains));
        }

        const queryBuilder = db.query.cars.findMany({
            columns: {
                id: true,
                name: true,
                images: true,
                isAvailable: true,
                pricePerDay: true,
                bodyType: true,
                transmission: true,
                fuelType: true,
                doors: true,
                make: true,
                model: true,
                features: true,
            },
            where: and(...conditions),
            limit: filters.limit,
        });

        const listedCars = await queryBuilder;

        return c.json({
            success: true,
            data: listedCars.map((car) => ({
                ...car,
                displayName: `${car.make} ${car.model}`,
                seatCount: car.doors,
            })),
            meta: {
                results: listedCars.length,
                limit: filters.limit,
            },
        });
    })
    .get(
        "/:id",
        zValidator(
            "param",
            z.object({
                id: z.string().min(1, "Car ID is required"),
            }),
        ),
        async (c) => {
            const {id} = c.req.valid("param");

            const car = await db.query.cars.findFirst({
                where: eq(cars.id, id),
                with: {
                    owner: {
                        columns: {
                            id: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            });
            if (!car) {
                return c.json({success: false, message: "Car not found"}, 404);
            }
            return c.json({success: true, data: car}, 200);
        },
    )
    .post(
        "/",
        clerkMiddleware(),
        zValidator("json", insertCarSchema),
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
                console.log(
                    "Received car data:",
                    JSON.stringify(body, null, 2),
                );

                const user = await db.query.users.findFirst({
                    where: eq(users.clerk_id, auth.userId),
                });
                if (!user) {
                    return c.json(
                        {success: false, message: "User not found"},
                        404,
                    );
                }

                // Remove carPurpose field before inserting to database
                const {carPurpose, ...carData} = body;
                console.log("Car purpose:", carPurpose);
                console.log(
                    "Final car data for DB:",
                    JSON.stringify(carData, null, 2),
                );

                const values = {
                    ...carData,
                    ownerId: user.id,
                    id: createId(),
                };

                const [car] = await db
                    .insert(cars)
                    .values({
                        ...values,
                        dateManufactured: new Date(values.dateManufactured),
                    })
                    .returning();

                console.log("Car created successfully:", car.id);
                return c.json({success: true, car}, 200);
            } catch (error) {
                console.error("Error creating car:", error);
                return c.json(
                    {
                        success: false,
                        message:
                            error instanceof Error
                                ? error.message
                                : "Failed to create car",
                        error:
                            error instanceof Error
                                ? error.stack
                                : "Unknown error",
                    },
                    500,
                );
            }
        },
    )
    .put(
        "/",
        clerkMiddleware(),
        zValidator("json", updateCarSchema),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json(
                    {success: false, message: "Unauthorized user"},
                    401,
                );
            }
            const body = c.req.valid("json");
            if (!body.id) {
                return c.json(
                    {success: false, message: "Car id is required"},
                    400,
                );
            }
            const car = await db.query.cars.findFirst({
                where: eq(cars.id, body.id),
            });
            if (!car) {
                return c.json({success: false, message: "car not found"}, 404);
            }

            // Convert dateManufactured to Date object for database
            const {id, ...updateData} = body;
            const dataToUpdate = {
                ...updateData,
                dateManufactured: new Date(updateData.dateManufactured),
            };

            const [response] = await db
                .update(cars)
                .set(dataToUpdate)
                .where(eq(cars.id, body.id))
                .returning();
            if (!response) {
                return c.json(
                    {success: false, data: "Failed to update car"},
                    500,
                );
            }

            return c.json({success: true, data: response});
        },
    )
    .delete(
        "/:id?",
        clerkMiddleware(),
        zValidator("param", z.object({id: z.string().optional()})),
        async (c) => {
            const auth = getAuth(c);
            if (!auth?.userId) {
                return c.json(
                    {success: false, message: "Unauthorized user"},
                    401,
                );
            }
            const {id} = c.req.valid("param");
            if (!id) {
                return c.json(
                    {success: false, message: "Car ID is required"},
                    400,
                );
            }

            const car = await db
                .delete(cars)
                .where(eq(cars.id, id))
                .returning()
                .then((res) => res[0]);

            if (!car) {
                return c.json(
                    {
                        success: false,
                        message: "Car not found or already deleted",
                    },
                    404,
                );
            }

            return c.json({
                success: true,
                message: "Car deleted successfully",
                data: car,
            });
        },
    );

export default app;
