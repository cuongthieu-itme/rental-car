import {useQuery} from "@tanstack/react-query";

import {client} from "@/lib/hono";

export const useGetPendingRides = () => {
    return useQuery({
        queryKey: ["rides", "pending"],
        queryFn: async () => {
            const response = await client.api.rides.pending.$get();

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to fetch pending rides",
                );
            }

            const {data} = await response.json();
            return data;
        },
    });
};
