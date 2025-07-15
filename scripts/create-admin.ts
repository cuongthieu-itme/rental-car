import "dotenv/config";
import {clerkClient} from "@clerk/nextjs/server";
import {drizzle} from "drizzle-orm/node-postgres";
import {Pool} from "pg";
import {eq} from "drizzle-orm";
import * as schema from "../db/schema";

// Create database connection for script
const pool = new Pool({connectionString: process.env.DATABASE_URL});
const db = drizzle(pool, {schema});

const {users} = schema;

type UserRole = "user" | "admin" | "super_admin";

async function createAdmin(email: string, role: UserRole = "admin") {
    try {
        console.log(`🔍 Looking for user with email: ${email}`);

        // 1. Find user in Clerk
        const client = await clerkClient();
        const clerkUsers = await client.users.getUserList({
            emailAddress: [email],
        });

        if (clerkUsers.data.length === 0) {
            throw new Error(`❌ User with email ${email} not found in Clerk`);
        }

        const clerkUser = clerkUsers.data[0];
        console.log(`✅ Found Clerk user: ${clerkUser.id}`);

        // 2. Update Clerk publicMetadata
        await client.users.updateUserMetadata(clerkUser.id, {
            publicMetadata: {
                ...clerkUser.publicMetadata,
                role: role,
            },
        });
        console.log(
            `✅ Updated Clerk metadata for ${email} with role: ${role}`,
        );

        // 3. Update local database
        const [updatedUser] = await db
            .update(users)
            .set({
                role: role,
                isNew: false,
            })
            .where(eq(users.clerk_id, clerkUser.id))
            .returning();

        if (!updatedUser) {
            // Create user in local DB if doesn't exist
            const [newUser] = await db
                .insert(users)
                .values({
                    id: clerkUser.id,
                    clerk_id: clerkUser.id,
                    email: clerkUser.emailAddresses[0].emailAddress,
                    firstName: clerkUser.firstName || "",
                    lastName: clerkUser.lastName || "",
                    role: role,
                    isNew: false,
                })
                .returning();

            console.log(
                `✅ Created user in DB with role ${role}: ${newUser.email}`,
            );
        } else {
            console.log(
                `✅ Updated existing user to ${role}: ${updatedUser.email}`,
            );
        }

        console.log(`🎉 Successfully set ${role} role for: ${email}`);

        // Close database connection
        await pool.end();
    } catch (error) {
        console.error(`❌ Error setting user role:`, error);
        await pool.end();
        throw error;
    }
}

// Usage: Run with email parameter and optional role
const email = process.argv[2];
const roleArg = process.argv[3] as UserRole;

if (!email) {
    console.error("❌ Please provide email address");
    console.log(
        "Usage: tsx scripts/create-admin.ts your-email@example.com [admin|super_admin]",
    );
    console.log("Default role is 'admin' if not specified");
    process.exit(1);
}

const validRoles: UserRole[] = ["admin", "super_admin"];
const role: UserRole =
    roleArg && validRoles.includes(roleArg) ? roleArg : "admin";

if (roleArg && !validRoles.includes(roleArg)) {
    console.warn(`⚠️  Invalid role '${roleArg}'. Using default role 'admin'`);
}

createAdmin(email, role)
    .then(() => {
        console.log("✅ Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Script failed:", error);
        process.exit(1);
    });
