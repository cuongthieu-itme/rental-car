import {useMutation, useQueryClient} from "@tanstack/react-query";
import {z} from "zod";
import {client} from "@/lib/hono";

// Rental creation schema
const createRentalSchema = z.object({
    carId: z.string().min(1, "Car ID is required"),
    driverId: z.string().optional().nullable(),
    startDate: z.string().datetime("Invalid start date"),
    endDate: z.string().datetime("Invalid end date"),
    pickupLocation: z.string().min(1, "Pickup location is required"),
    dropoffLocation: z.string().min(1, "Dropoff location is required"),
    totalCost: z.number().positive("Total cost must be positive"),
});

export type CreateRentalData = z.infer<typeof createRentalSchema>;

export const useCreateRental = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateRentalData) => {
            const response = await client.api.rentals.$post({
                json: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create rental");
            }

            const result = await response.json();
            return result.data;
        },
        onSuccess: () => {
            // Invalidate rentals query to refresh the list
            queryClient.invalidateQueries({queryKey: ["rentals"]});
        },
    });
};
