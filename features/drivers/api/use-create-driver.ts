import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {client} from "@/lib/hono";

type CreateDriverRequest = {
    name: string;
    email: string;
    licenseNumber: string;
    carId?: string;
};

export const useCreateDriver = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateDriverRequest) => {
            const response = await client.api.drivers.$post({
                json: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create driver");
            }

            return await response.json();
        },
        onSuccess: () => {
            toast.success("Driver created successfully");
            queryClient.invalidateQueries({queryKey: ["drivers"]});
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create driver");
        },
    });
};
