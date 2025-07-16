import {useMutation} from "@tanstack/react-query";
import {z} from "zod";
import {useQueryClient} from "@tanstack/react-query";

import {insertUserSchema} from "@/db/schema";
import {client} from "@/lib/hono";

// Define the update user data type to match API expectations
const updateUserData = z.object({
    id: z.string(),
    clerk_id: z.string(),
    email: z.string(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
});

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const query = useMutation({
        mutationFn: async (data: z.infer<typeof updateUserData>) => {
            const response = await client.api.users[":id"].$put({
                param: {id: data.id},
                json: {
                    id: data.id,
                    clerk_id: data.clerk_id,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    location: data.location,
                    address: data.address,
                    phone: data.phone,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update user");
            }
            const {data: updatedUser} = await response.json();
            return updatedUser;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["users"]);
        },
    });
    return query;
};
