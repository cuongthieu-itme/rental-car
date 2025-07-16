import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {client} from "@/lib/hono";

export type UpdateRideStatusRequest = {
    id: string;
    status: "active" | "cancelled";
};

export const useUpdateRideStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateRideStatusRequest) => {
            const response = await client.api.rides[":id"]["status"].$patch({
                param: {id: data.id},
                json: {status: data.status},
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to update ride status",
                );
            }

            return await response.json();
        },
        onSuccess: (data) => {
            const action =
                data.data?.status === "active" ? "approved" : "rejected";
            toast.success(`Ride ${action} successfully`);
            queryClient.invalidateQueries({queryKey: ["rides"]});
            queryClient.invalidateQueries({queryKey: ["rides", "pending"]});
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update ride status");
        },
    });
};
