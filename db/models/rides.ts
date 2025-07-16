import {relations} from "drizzle-orm";
import {pgTable, text, timestamp, decimal, integer} from "drizzle-orm/pg-core";
import {users} from "./users";
import {cars} from "./cars";
import {drivers} from "./drivers";
import {statusEnum} from "./enums";

export const rides = pgTable("rides", {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id),
    carId: text("car_id").references(() => cars.id),
    driverId: text("driver_id").references(() => drivers.id),
    pickupTime: timestamp("pickup_time").notNull(),
    dropoffTime: timestamp("dropoff_time"),
    pickupLocation: text("pickup_location").notNull(),
    dropoffLocation: text("dropoff_location").notNull(),
    estimatedDistance: decimal("estimated_distance", {
        precision: 8,
        scale: 2,
    }).notNull(),
    estimatedDuration: integer("estimated_duration").notNull(), // in minutes
    totalCost: decimal("total_cost", {precision: 10, scale: 2}).notNull(),
    status: statusEnum("status").notNull().default("pending"),
    passengerCount: integer("passenger_count").notNull().default(1),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rideRelations = relations(rides, ({one}) => ({
    user: one(users, {fields: [rides.userId], references: [users.id]}),
    car: one(cars, {fields: [rides.carId], references: [cars.id]}),
    driver: one(drivers, {
        fields: [rides.driverId],
        references: [drivers.id],
    }),
}));
