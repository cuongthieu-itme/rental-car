import {useMutation} from "@tanstack/react-query";

import {client} from "@/lib/hono";

export const useUploadImage = () => {
    const uploadImage = useMutation({
        mutationFn: async (images: File[]) => {
            if (!images || images.length === 0) {
                throw new Error("No images provided");
            }

            const response = await client.api.cars.images.$post({
                form: {
                    images: images,
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Image upload failed:", errorText);
                throw new Error("Failed to upload images");
            }

            const result = await response.json();
            return result;
        },
    });
    return uploadImage;
};
