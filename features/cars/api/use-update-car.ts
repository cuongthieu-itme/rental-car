import {useMutation, useQueryClient} from "@tanstack/react-query";
import {z} from "zod";

import {insertCarSchema} from "@/db/schema";
import {client} from "@/lib/hono";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const carUpdateSchema = z
    .object(insertCarSchema._def.schema.shape)
    .omit({images: true})
    .merge(
        z.object({
            images: z.array(z.string()),
            id: z.string(),
        }),
    );

export const useUpdateCar = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (car: z.infer<typeof carUpdateSchema>) => {
            // Ensure all boolean fields have proper values
            const carData = {
                ...car,
                isForDelivery: car.isForDelivery ?? false,
                isAvailable: car.isAvailable ?? true,
                isForHire: car.isForHire ?? false,
                isForRent: car.isForRent ?? false,
            };

            const response = await client.api.cars.$put({
                json: carData,
            });
            if (!response.ok) {
                throw new Error("Failed to update car");
            }
            const {data} = await response.json();
            return data;
        },
        onSuccess: (data, variables) => {
            // Invalidate the specific car query using the correct key format
            queryClient.invalidateQueries({queryKey: [`car-${variables.id}`]});
            // Also invalidate the cars list query
            queryClient.invalidateQueries({queryKey: ["cars"]});
        },
    });
    return mutation;
};
