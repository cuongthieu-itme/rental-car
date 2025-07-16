import {useMutation, useQueryClient} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await client.api.users[":id"].$delete({
                param: {id},
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete user");
            }
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users"]);
        },
    });
};
