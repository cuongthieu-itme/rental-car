import {hc} from "hono/client";

import {AppType} from "@/app/api/[[...route]]/route";

// Use localhost instead of 127.0.0.1 to avoid CORS issues
const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace("127.0.0.1", "localhost") ||
    "http://localhost:3000";

export const client = hc<AppType>(baseUrl);
