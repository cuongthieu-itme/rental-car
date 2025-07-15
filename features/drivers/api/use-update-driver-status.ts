import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {client} from "@/lib/hono";

export type UpdateDriverStatusRequest = {
    id: string;
    isApproved: boolean;
};

export const useUpdateDriverStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateDriverStatusRequest) => {
            // Use string interpolation to call the correct endpoint
            const response = await client.api[
                `drivers/${data.id}/status`
            ].$patch({
                json: {isApproved: data.isApproved},
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to update driver status",
                );
            }

            return await response.json();
        },
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries({queryKey: ["drivers"]});
            queryClient.invalidateQueries({queryKey: ["drivers", "pending"]});
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update driver status");
        },
    });
};
