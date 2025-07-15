import {useQuery} from "@tanstack/react-query";

import {client} from "@/lib/hono";

export const useGetDrivers = () => {
    return useQuery({
        queryKey: ["drivers"],
        queryFn: async () => {
            const response = await client.api.drivers.$get();
            if (!response.ok) {
                throw new Error("Failed to fetch drivers");
            }
            const {data} = await response.json();
            return data;
        },
    });
};
