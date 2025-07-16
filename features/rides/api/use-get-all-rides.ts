import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetAllRides = () => {
    const query = useQuery({
        queryKey: ["rides", "admin", "all"],
        queryFn: async () => {
            const response = await client.api.rides["admin"]["all"].$get();
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch rides");
            }

            return result.data;
        },
    });

    return query;
};
