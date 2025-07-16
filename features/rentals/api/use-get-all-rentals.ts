import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetAllRentals = () => {
    const query = useQuery({
        queryKey: ["rentals", "admin", "all"],
        queryFn: async () => {
            const response = await client.api.rentals["admin"]["all"].$get();
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch rentals");
            }

            return result.data;
        },
    });

    return query;
};
