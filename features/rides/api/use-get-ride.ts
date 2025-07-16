import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetRide = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ["ride", {id}],
        queryFn: async () => {
            const response = await client.api.rides[":id"].$get({
                param: {id: id!},
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch ride");
            }

            return result.data;
        },
    });

    return query;
};
