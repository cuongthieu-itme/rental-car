import {clerkMiddleware, getAuth} from "@hono/clerk-auth";
import {v2 as cloudinary, UploadApiResponse} from "cloudinary";
import {eq} from "drizzle-orm";
import {Hono} from "hono";
import {z} from "zod";

import {db} from "@/db/drizzle";
import {cars} from "@/db/models/cars";
import {deleteFromCloudinary} from "@/lib/file";

if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    throw new Error("Missing required Cloudinary environment variables");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validation schema for images
const uploadImageSchema = z.object({
    images: z
        .array(z.instanceof(File))
        .min(1, "At least one image is required"),
});

const app = new Hono()
    .post("/", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized user"}, 401);
        }

        try {
            // Parse form data manually to handle array properly
            const formData = await c.req.formData();

            // Get all files with 'images' key
            const imageFiles: File[] = [];
            for (const [key, value] of formData.entries()) {
                if (key === "images" && value instanceof File) {
                    imageFiles.push(value);
                }
            }

            // Validate the parsed data
            const validation = uploadImageSchema.safeParse({
                images: imageFiles,
            });
            if (!validation.success) {
                return c.json(
                    {
                        success: false,
                        message: "Invalid image data",
                        errors: validation.error.issues,
                    },
                    400,
                );
            }

            const uploadPromises = imageFiles.map(async (file) => {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    return new Promise<UploadApiResponse>((resolve, reject) => {
                        cloudinary.uploader
                            .upload_stream(
                                {
                                    folder: "car-images",
                                    resource_type: "auto",
                                    upload_preset:
                                        process.env.NEXT_PUBLIC_UPLOAD_PRESET ||
                                        undefined,
                                    transformation: [
                                        {quality: "auto"},
                                        {fetch_format: "auto"},
                                    ],
                                },
                                (error, result) => {
                                    if (error) {
                                        reject(error);
                                    } else if (result) {
                                        resolve(result);
                                    } else {
                                        reject(
                                            new Error(
                                                "No result from Cloudinary",
                                            ),
                                        );
                                    }
                                },
                            )
                            .end(buffer);
                    });
                } catch (fileError) {
                    throw new Error(
                        `Failed to process file ${file.name}: ${fileError}`,
                    );
                }
            });

            const uploadResults = await Promise.all(uploadPromises);
            const imageUrls = uploadResults.map((result) => result.secure_url);

            return c.json(
                {
                    success: true,
                    images: imageUrls,
                },
                200,
            );
        } catch (error) {
            console.error("Image upload error:", error);
            return c.json(
                {
                    success: false,
                    message:
                        "Failed to upload images. Please check Cloudinary configuration.",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
                500,
            );
        }
    })
    .delete("/:url", clerkMiddleware(), async (c) => {
        const auth = getAuth(c);
        if (!auth?.userId) {
            return c.json({success: false, message: "Unauthorized user"}, 401);
        }

        try {
            // Validate URL parameter
            const url = c.req.param("url");
            if (!url) {
                return c.json(
                    {success: false, message: "URL parameter is required"},
                    400,
                );
            }

            // Validate request body
            const body = await c.req.json();
            const bodyValidation = z
                .object({
                    carId: z.string().min(1, "Car ID is required"),
                })
                .safeParse(body);

            if (!bodyValidation.success) {
                return c.json(
                    {
                        success: false,
                        message: "Invalid request body",
                        errors: bodyValidation.error.issues,
                    },
                    400,
                );
            }

            const {carId} = bodyValidation.data;

            const decodedUrl = decodeURIComponent(url);
            const publicId = decodedUrl
                .split("/")
                .slice(-1)
                .join("")
                .replace(/\.[^/.]+$/, "");

            const deleteFromCloudinaryIfExists = async (publicId: string) => {
                try {
                    return await deleteFromCloudinary(`car-images/${publicId}`);
                } catch (error) {
                    console.error(
                        "Failed to delete image from Cloudinary:",
                        error,
                    );
                    return false;
                }
            };

            const updateDatabaseImages = async (
                carId: string,
                images: string[],
                decodedUrl: string,
            ) => {
                const updatedImages = images.filter(
                    (image) => image !== decodedUrl,
                );

                try {
                    await db
                        .update(cars)
                        .set({images: updatedImages})
                        .where(eq(cars.id, carId));
                    return true;
                } catch (error) {
                    console.error("Failed to update database:", error);
                    return false;
                }
            };

            const car = await db.query.cars.findFirst({
                where: eq(cars.id, carId),
            });

            if (!car) {
                return c.json({success: false, message: "Car not found"}, 404);
            }

            const imageExistsInDb = car.images.includes(decodedUrl);

            const cloudinarySuccess = imageExistsInDb
                ? await deleteFromCloudinaryIfExists(publicId)
                : false;

            if (imageExistsInDb) {
                const dbSuccess = await updateDatabaseImages(
                    car.id,
                    car.images,
                    decodedUrl,
                );

                if (dbSuccess && cloudinarySuccess) {
                    return c.json({
                        success: true,
                        message:
                            "Image deleted from both Cloudinary and database",
                    });
                }

                if (dbSuccess && !cloudinarySuccess) {
                    return c.json({
                        success: true,
                        message:
                            "Image deleted from database but not found in Cloudinary",
                    });
                }

                return c.json({
                    success: false,
                    message: "Failed to update database",
                });
            }

            const cloudinaryDeleteOnly =
                await deleteFromCloudinaryIfExists(publicId);

            return c.json({
                success: cloudinaryDeleteOnly,
                message: cloudinaryDeleteOnly
                    ? "Image deleted from Cloudinary but was not in database"
                    : "Image was not found in database or Cloudinary",
            });
        } catch (error) {
            console.error("Image deletion error:", error);
            return c.json(
                {
                    success: false,
                    message: "Failed to delete image",
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
                500,
            );
        }
    });

export default app;
