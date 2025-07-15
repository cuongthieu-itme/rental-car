import {Hono} from "hono";
import {cors} from "hono/cors";
import {logger} from "hono/logger";
import {ContentfulStatusCode} from "hono/utils/http-status";
import {handle} from "hono/vercel";

import cars from "./(modules)/cars/cars";
import images from "./(modules)/cars/images";
import drivers from "./(modules)/drivers/drivers";
import rentals from "./(modules)/rentals/rentals";
import clerkManager from "./(modules)/users/clerkManager";
import users from "./(modules)/users/users";
import webhooks from "./(modules)/users/webhooks";

const app = new Hono().basePath("/api");

// Add CORS middleware
app.use(
    "*",
    cors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    }),
);

app.use("*", logger());
const routes = app
    .route("/users", users)
    .route("/user", clerkManager)
    .route("/cars", cars)
    .route("/cars/images", images)
    .route("/drivers", drivers)
    .route("/rentals", rentals)
    .route("/users/webhooks", webhooks);

routes.onError((err, c) => {
    console.error(err);
    if (
        err &&
        typeof err === "object" &&
        "status" in err &&
        "errors" in err &&
        Array.isArray(err.errors)
    ) {
        return c.json(
            {success: false, message: err.errors[0].message},
            err.status as unknown as ContentfulStatusCode,
        );
    }
    return c.json(
        {success: false, message: "Internal server error", error: err.message},
        500,
    );
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);

export type AppType = typeof routes;
