import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  API_PORT: z.coerce.number().default(4000),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  ADMIN_API_KEY: z.string().min(12, "ADMIN_API_KEY must be at least 12 characters"),
  /** Comma-separated emails that may use the admin console after signing in. */
  ADMIN_EMAILS: z.string().default(""),
  /** Send scheduled emails: weekly scheme alerts (Mondays from 8:00 India time) and the yearly terms reminder. */
  SCHEDULED_EMAILS: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** The server runs deploy/backup.sh daily and deploy/restore-drill.sh monthly; alert if either stops. */
  BACKUP_CHECK: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** Read editors' event sources once a day (from 6:00 India time) and import new or changed events. */
  EVENT_SYNC: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** Tests only: let the event sync read http:// and local-network addresses. Refused in production. */
  EVENT_SYNC_ALLOW_PRIVATE: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  /** Where to email alerts about server errors and stalled scheduled jobs. Strongly recommended in production. */
  OPS_ALERT_EMAIL: z.string().email().optional().or(z.literal("").transform(() => undefined)),
  /** Shared secret the web server uses to report its own errors to the API (POST /v1/ops/report). */
  OPS_REPORT_TOKEN: z.string().min(24, "OPS_REPORT_TOKEN must be at least 24 characters").optional().or(z.literal("").transform(() => undefined)),
  /** Public site URL, used in notification emails. */
  SITE_URL: z.string().url().default("http://localhost:3000"),
  OTP_DELIVERY: z.enum(["dev", "email"]).default("dev"),
  /** ZeptoMail "Send Mail" token (Mail Agents → SMTP/API → API). With or without the "Zoho-enczapikey" prefix. */
  ZEPTOMAIL_TOKEN: z.string().optional(),
  /** ZeptoMail send endpoint for your account's data centre (India by default). */
  ZEPTOMAIL_API_URL: z.string().url().default("https://api.zeptomail.in/v1.1/email"),
  OTP_FROM_EMAIL: z.string().default("Foundura <login@example.com>"),
  NODE_ENV: z.string().default("development"),
  /**
   * How many reverse proxies sit between users and this API (the web server counts as one).
   * Needed so rate limits apply per visitor, not per web server. Keep the API off the public internet.
   */
  TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
});

export type AppConfig = z.infer<typeof envSchema>;
export const CONFIG = Symbol("CONFIG");

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  if (parsed.data.NODE_ENV === "production") {
    const problems = productionProblems(parsed.data);
    if (problems.length) throw new Error(`Unsafe production settings:\n- ${problems.join("\n- ")}`);
  }
  return parsed.data;
}

/** Settings that are fine on a laptop but dangerous on a live server. */
export function productionProblems(c: AppConfig): string[] {
  const p: string[] = [];
  const placeholder = /change-me|example|test|secret/i;
  if (c.OTP_DELIVERY === "dev") p.push("OTP_DELIVERY=dev shows sign-in codes on screen; use email");
  if (c.OTP_DELIVERY === "email" && !c.ZEPTOMAIL_TOKEN) p.push("ZEPTOMAIL_TOKEN is required to send email");
  if (/example\.com/i.test(c.OTP_FROM_EMAIL)) p.push("OTP_FROM_EMAIL still uses example.com; use your own verified domain");
  if (c.JWT_SECRET.length < 32 || placeholder.test(c.JWT_SECRET)) p.push("JWT_SECRET must be a random string of at least 32 characters");
  if (c.ADMIN_API_KEY.length < 24 || placeholder.test(c.ADMIN_API_KEY)) p.push("ADMIN_API_KEY must be a random string of at least 24 characters");
  if (!c.SITE_URL.startsWith("https://")) p.push("SITE_URL must be your public https:// address");
  if (/localhost|127\.0\.0\.1/.test(c.CORS_ORIGINS)) p.push("CORS_ORIGINS must not include localhost");
  if (c.EVENT_SYNC_ALLOW_PRIVATE) p.push("EVENT_SYNC_ALLOW_PRIVATE lets event sources reach the server's own network; turn it off");
  // A database outside this server (a managed cluster) must be reached over verified TLS.
  try {
    const u = new URL(c.DATABASE_URL);
    const onThisServer = ["db", "localhost", "127.0.0.1"].includes(u.hostname);
    if (!onThisServer && (u.searchParams.get("sslmode") !== "verify-full" || !u.searchParams.get("sslrootcert"))) {
      p.push("DATABASE_URL for a managed database must end with ?sslmode=verify-full&sslrootcert=/certs/db-ca.crt (see DEPLOY.md)");
    }
  } catch {
    p.push("DATABASE_URL isn't a valid postgresql:// address");
  }
  if (c.TRUST_PROXY < 1) p.push("TRUST_PROXY must be at least 1 (the web server forwards each visitor's IP)");
  return p;
}
