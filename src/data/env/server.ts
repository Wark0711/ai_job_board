import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        NEON_DB_URL: z.string().url(),
        CLERK_SECRET_KEY: z.string().min(1),
        CLERK_WEBHOOK_SECRET: z.string().min(1),
        UPLOADTHING_TOKEN: z.string().min(1),
        GEMINI_API_KEY: z.string().min(1),
        RESEND_API_KEY: z.string().min(1),
        SERVER_URL: z.string().min(1)
    },
    emptyStringAsUndefined: true,
    experimental__runtimeEnv: process.env
});