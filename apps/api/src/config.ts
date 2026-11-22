import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  ADMIN_API_KEY: z.string().min(12, "ADMIN_API_KEY must be at least 12 characters"),
  /** Comma-separated emails that may use the admin console after signing in. */
  ADMIN_EMAILS: z.string().default(""),
  /** Send the weekly scheme-alerts digest automatically (Mondays from 8:00 India time). */
  DIGEST_AUTO_SEND: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** Public site URL, used in notification emails. */
  SITE_URL: z.string().url().default("http://localhost:3000"),
  OTP_DELIVERY: z.enum(["dev", "email"]).default("dev"),
  RESEND_API_KEY: z.string().optional(),
  OTP_FROM_EMAIL: z.string().default("Foundura <login@example.com>"),
  NODE_ENV: z.string().default("development"),
});

export type AppConfig = z.infer<typeof envSchema>;
export const CONFIG = Symbol("CONFIG");

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  if (parsed.data.NODE_ENV === "production" && parsed.data.OTP_DELIVERY === "dev") {
    throw new Error("OTP_DELIVERY=dev is not allowed in production");
  }
  return parsed.data;
}
