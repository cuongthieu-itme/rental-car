import {useMutation, useQueryClient} from "@tanstack/react-query";
import {z} from "zod";
import {client} from "@/lib/hono";

// Update rental schema matching the API
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

export type UpdateRentalData = z.infer<typeof updateRentalSchema>;

export const useUpdateRental = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateRentalData) => {
            const response = await client.api.rentals.$put({
                json: data,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    "message" in result
                        ? result.message
                        : "Failed to update rental",
                );
            }

            return "data" in result ? result.data : null;
        },
        onSuccess: () => {
            // Invalidate all rental queries to refresh data
            queryClient.invalidateQueries({queryKey: ["rentals"]});
            queryClient.invalidateQueries({queryKey: ["rental"]});
        },
    });
};
