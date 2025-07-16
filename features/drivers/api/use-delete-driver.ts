import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {client} from "@/lib/hono";

export const useDeleteDriverMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await client.api.drivers[":id"].$delete({
                param: {id},
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete driver");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Driver deleted successfully");
            queryClient.invalidateQueries({queryKey: ["drivers"]});
        },
        onError: (error) => {
            toast.error(error.message || "Failed to delete driver");
        },
    });
};
