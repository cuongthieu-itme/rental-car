import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useDeleteRide = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await client.api.rides[":id"].$delete({
                param: {id},
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete ride");
            }

            return result;
        },
        onSuccess: () => {
            // Invalidate all ride queries to refresh data
            queryClient.invalidateQueries({queryKey: ["rides"]});
        },
    });
};
