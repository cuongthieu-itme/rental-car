-- Create enum type first
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'super_admin');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add role column with default 'user' (only if it doesn't exist)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE "users" ADD COLUMN "role" "role" DEFAULT 'user' NOT NULL;
    END IF;
END $$;

-- Migrate existing data: convert isAdmin = true to role = 'admin' (only if is_admin column exists)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
        UPDATE "users" SET "role" = 'admin' WHERE "is_admin" = true;
        -- Drop the old isAdmin column
        ALTER TABLE "users" DROP COLUMN "is_admin";
    END IF;
END $$;