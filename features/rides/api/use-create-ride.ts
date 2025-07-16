import {useMutation, useQueryClient} from "@tanstack/react-query";
import {z} from "zod";
import {client} from "@/lib/hono";

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

export type CreateRideData = z.infer<typeof createRideSchema>;

export const useCreateRide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateRideData) => {
            const response = await client.api.rides.$post({
                json: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create ride");
            }

            const result = await response.json();
            return result.data;
        },
        onSuccess: () => {
            // Invalidate rides query to refresh the list
            queryClient.invalidateQueries({queryKey: ["rides"]});
        },
    });
};
