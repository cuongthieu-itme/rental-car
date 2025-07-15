import {useQuery} from "@tanstack/react-query";

import {client} from "@/lib/hono";

export const useGetPendingDrivers = () => {
    return useQuery({
        queryKey: ["drivers", "pending"],
        queryFn: async () => {
            const response = await client.api.drivers.pending.$get();
            if (!response.ok) {
                throw new Error("Failed to fetch pending drivers");
            }
            const {data} = await response.json();
            return data;
        },
    });
};
