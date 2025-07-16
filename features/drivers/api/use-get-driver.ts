import {useQuery} from "@tanstack/react-query";

import {client} from "@/lib/hono";

export const useGetDriver = (id?: string) => {
    return useQuery({
        enabled: !!id,
        queryKey: [`driver-${id}`],
        queryFn: async () => {
            if (!id) throw new Error("Driver ID is required");

            const response = await client.api.drivers[":id"].$get({
                param: {id},
            });
            if (!response.ok) {
                throw new Error("Failed to fetch driver");
            }
            const {data} = await response.json();
            return data;
        },
    });
};
