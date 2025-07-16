import {useMutation, useQueryClient} from "@tanstack/react-query";
import {z} from "zod";
import {client} from "@/lib/hono";

// Update ride schema matching the API
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

export type UpdateRideData = z.infer<typeof updateRideSchema>;

export const useUpdateRide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateRideData) => {
            const response = await client.api.rides.$put({
                json: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update ride");
            }

            const result = await response.json();
            return result.data;
        },
        onSuccess: (data) => {
            // Invalidate rides queries to refresh the list
            queryClient.invalidateQueries({queryKey: ["rides"]});
            // Update the specific ride in cache
            queryClient.setQueryData(["ride", {id: data.id}], data);
        },
    });
};
