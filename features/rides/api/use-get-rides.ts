import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetRides = () => {
    const query = useQuery({
        queryKey: ["rides"],
        queryFn: async () => {
            const response = await client.api.rides.$get();
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch rides");
            }

            return result.data;
        },
    });

    return query;
};
