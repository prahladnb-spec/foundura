import type { INestApplication } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "../src/db/client";
import { TermsReminderService } from "../src/legal/terms-reminder.service";
import { MailerService } from "../src/mail/mailer.service";
import { DATABASE_URL, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;

beforeAll(async () => {
  ({ app, http } = await startTestApp());
});
afterAll(async () => {
  await app?.close();
});

describe("yearly terms reminder", () => {
  it("emails accounts once a year, starting a year after sign-up", async () => {
    await signIn(http, "old@example.com");
    const fresh = await signIn(http, "new@example.com");
    const { db, pool } = createDb(DATABASE_URL);
    await db.execute(sql`update users set created_at = now() - interval '400 days' where email = 'old@example.com'`);
    await pool.end();

    const mailer = app.get(MailerService);
    const svc = app.get(TermsReminderService);
    const reminders = () => mailer.outbox.filter((m) => m.subject.startsWith("Your yearly reminder"));

    expect(await svc.run()).toEqual({ sent: 1, failed: 0 });
    expect(reminders().map((m) => m.to)).toEqual(["old@example.com"]);
    expect(reminders()[0].text).toMatch(/\/terms/);
    expect(reminders()[0].text).toMatch(/never handles money/);

    expect(await svc.run()).toEqual({ sent: 0, failed: 0 }); // not again this year

    const nextYear = new Date(Date.now() + 366 * 86_400_000);
    expect((await svc.run(nextYear)).sent).toBe(2); // both are due a year on

    const exp = await http.get("/v1/me/export").set(fresh).expect(200);
    expect(exp.body.account.termsRemindedAt).toBeTruthy();
  });
});
