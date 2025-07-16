CREATE TABLE IF NOT EXISTS "rides" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"car_id" text,
	"driver_id" text,
	"pickup_time" timestamp NOT NULL,
	"dropoff_time" timestamp,
	"pickup_location" text NOT NULL,
	"dropoff_location" text NOT NULL,
	"estimated_distance" numeric(8, 2) NOT NULL,
	"estimated_duration" integer NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"passenger_count" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rides" ADD CONSTRAINT "rides_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rides" ADD CONSTRAINT "rides_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rides" ADD CONSTRAINT "rides_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
