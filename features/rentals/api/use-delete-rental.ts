import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useDeleteRental = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await client.api.rentals[":id"].$delete({
                param: {id},
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete rental");
            }

            return result;
        },
        onSuccess: () => {
            // Invalidate all rental queries to refresh data
            queryClient.invalidateQueries({queryKey: ["rentals"]});
        },
    });
};
