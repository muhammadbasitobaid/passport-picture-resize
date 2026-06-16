import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    APP_URL: z.string().url().optional(),
    GOOGLE_SITE_VERIFICATION_ID: z.string().optional(),
    // Base URL of the background-removal microservice (services/bg-removal).
    // Falls back to http://localhost:7001 in the route handler when unset.
    BG_REMOVAL_URL: z.string().url().optional(),
  },
  runtimeEnv: {
    APP_URL: process.env.APP_URL,
    GOOGLE_SITE_VERIFICATION_ID: process.env.GOOGLE_SITE_VERIFICATION_ID,
    BG_REMOVAL_URL: process.env.BG_REMOVAL_URL,
  },
  // Treat empty strings (e.g. an unset `APP_URL` secret passed as "") as
  // undefined so optional vars don't fail `.url()` validation in CI.
  emptyStringAsUndefined: true,
});
