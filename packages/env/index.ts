import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets";
import { z } from "zod";

// import { env as authEnv } from "@defierros/auth/env";

export const env = createEnv({
  // extends: [authEnv, vercel()],
  extends: [vercel()],
  shared: {
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string(),
    CLERK_FRONTEND_API_URL: z.string().url(),
    CLERK_WEBHOOK_SECRET: z.string(),
    MERCADOPAGO_ACCESS_TOKEN: z.string(),
    WEBHOOKS_URL: z.string().url(),
    MERCADOPAGO_WEBHOOK_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    NEXT_PUBLIC_CLIENT_URL: z.string().url(),
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: z.string(),
    NEXT_PUBLIC_MERCADOPAGO_CLIENT_ID: z.string(),
  },
  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL,
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY:
      process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
    NEXT_PUBLIC_MERCADOPAGO_CLIENT_ID:
      process.env.NEXT_PUBLIC_MERCADOPAGO_CLIENT_ID,
  },
  skipValidation:
    !!process.env.CI || process.env.npm_lifecycle_event === "lint",
});
