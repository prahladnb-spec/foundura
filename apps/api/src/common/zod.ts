import { BadRequestException } from "@nestjs/common";
import type { z, ZodTypeAny } from "zod";

/** Validate a request body with a shared zod schema; 400 with readable messages on failure. */
export function parseBody<S extends ZodTypeAny>(schema: S, body: unknown): z.output<S> {
  const r = schema.safeParse(body);
  if (!r.success) {
    throw new BadRequestException({
      message: "Invalid request",
      issues: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  return r.data;
}

/** Today's date in India (YYYY-MM-DD), used for age calculations. */
export function todayInIndia(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(now);
}
