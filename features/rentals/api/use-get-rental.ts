import {useQuery} from "@tanstack/react-query";
import {client} from "@/lib/hono";

export const useGetRental = (id?: string) => {
    const query = useQuery({
        enabled: !!id,
        queryKey: ["rental", {id}],
        queryFn: async () => {
            const response = await client.api.rentals[":id"].$get({
                param: {id: id!},
            });
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to fetch rental");
            }

            return result.data;
        },
    });

    return query;
};
