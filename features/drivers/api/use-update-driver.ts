import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {client} from "@/lib/hono";

type UpdateDriverRequest = {
    id: string;
    name: string;
    email: string;
    licenseNumber: string;
    carId?: string;
    isActive?: boolean;
    isApproved?: boolean;
};

export const useUpdateDriver = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateDriverRequest) => {
            const response = await client.api.drivers[":id"].$put({
                param: {id: data.id},
                json: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update driver");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Driver updated successfully");
            queryClient.invalidateQueries({queryKey: ["drivers"]});
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update driver");
        },
    });
};
