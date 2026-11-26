import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { todayInIndia } from "../src/common/zod";
import type { Db } from "../src/db/client";
import { DB } from "../src/db/db.module";
import { newsletterSubscribers } from "../src/db/schema";
import { NewsletterService } from "../src/digest/newsletter.service";
import { type Mail, MailerService } from "../src/mail/mailer.service";
import { ADMIN_KEY, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
let mailer: MailerService;
let db: Db;
let newsletter: NewsletterService;

const mailsTo = (to: string) => mailer.outbox.filter((m) => m.to === to);
const params = (m: Mail, label: RegExp) => {
  const url = new URL(m.text.match(label)![1]);
  return { s: url.searchParams.get("s")!, t: url.searchParams.get("t")! };
};
const row = async (email: string) => (await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)))[0];

beforeAll(async () => {
  ({ app, http } = await startTestApp({ TRUST_PROXY: "1" }));
  mailer = app.get(MailerService);
  db = app.get(DB);
  newsletter = app.get(NewsletterService);
});
afterAll(async () => {
  await app?.close();
});

describe("weekly email for people without an account", () => {
  it("asks the address to confirm before sending anything else, and answers the same either way", async () => {
    const a = await http.post("/v1/newsletter/subscribe").send({ email: "Reader@Example.com", locale: "hi" }).expect(202);
    expect(a.body).toEqual({ ok: true });
    const [m] = mailsTo("reader@example.com");
    expect(m.subject).toBe("Foundura का साप्ताहिक ईमेल पक्का करें");
    expect(m.text).toMatch(/\/hi\/newsletter\/confirm\?s=/);
    expect((await row("reader@example.com"))?.confirmedAt).toBeNull();

    // Asking again straight away doesn't send a second email, and the answer gives nothing away.
    const b = await http.post("/v1/newsletter/subscribe").send({ email: "reader@example.com" }).expect(202);
    expect(b.body).toEqual(a.body);
    expect(mailsTo("reader@example.com")).toHaveLength(1);

    await http.post("/v1/newsletter/subscribe").send({ email: "not an email" }).expect(400);
  });

  it("confirms only with the signed link", async () => {
    const [m] = mailsTo("reader@example.com");
    const { s, t } = params(m, /यहाँ पक्का करें: (\S+)/);
    await http.post("/v1/newsletter/confirm").send({ s, t: t.replace(/.$/, (c) => (c === "A" ? "B" : "A")) }).expect(400);
    await http.post("/v1/newsletter/confirm").send({ s, t }).expect(200);
    const r = await row("reader@example.com");
    expect(r.confirmedAt).not.toBeNull();
    expect(r.noticeVersion).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Already confirmed: no new confirmation email.
    await http.post("/v1/newsletter/subscribe").send({ email: "reader@example.com" }).expect(202);
    expect(mailsTo("reader@example.com")).toHaveLength(1);
  });

  it("sends the week's email once to confirmed subscribers only", async () => {
    await http.post("/v1/newsletter/subscribe").send({ email: "pending@example.com" }).expect(202);
    const r = await http.post("/v1/admin/digest/send").set({ "x-admin-key": ADMIN_KEY }).expect(200);
    expect(r.body.newsletter).toMatchObject({ subscribers: 1, sent: 1, failed: 0 });

    const weekly = mailsTo("reader@example.com").filter((m) => m.subject.startsWith("आपका Foundura हफ़्ता"));
    expect(weekly).toHaveLength(1);
    expect(weekly[0].text).toContain("Foundura पर नई योजनाएँ");
    expect(weekly[0].text).toMatch(/\/hi\/schemes\//);
    expect(weekly[0].headers?.["List-Unsubscribe"]).toMatch(/\/api\/unsubscribe\?s=/);
    expect(mailsTo("pending@example.com").filter((m) => m.subject.startsWith("Your Foundura week"))).toHaveLength(0);

    const again = await newsletter.run(todayInIndia());
    expect(again).toMatchObject({ sent: 0, alreadySent: 1 });
  });

  it("deletes the address when the stop link is used", async () => {
    const weekly = mailsTo("reader@example.com").find((m) => m.subject.startsWith("आपका Foundura हफ़्ता"))!;
    const { s, t } = params(weekly, /ईमेल बंद करें: (\S+)|Stop these emails: (\S+)/);
    await http.post("/v1/newsletter/unsubscribe").send({ s, t: "x".repeat(43) }).expect(400);
    await http.post(`/v1/newsletter/unsubscribe?s=${encodeURIComponent(s)}&t=${t}`).expect(200); // one-click from a mail app
    expect(await row("reader@example.com")).toBeUndefined();
  });

  it("clears unconfirmed sign-ups after 7 days", async () => {
    await db
      .update(newsletterSubscribers)
      .set({ createdAt: new Date(Date.now() - 8 * 86_400_000) })
      .where(eq(newsletterSubscribers.email, "pending@example.com"));
    const r = await newsletter.run(todayInIndia());
    expect(r.expired).toBe(1);
    expect(await row("pending@example.com")).toBeUndefined();
  });

  it("is part of an account holder's export, and goes when they delete their account", async () => {
    await http.post("/v1/newsletter/subscribe").set("X-Forwarded-For", "203.0.113.9").send({ email: "both@example.com" }).expect(202);
    const me = await signIn(http, "both@example.com");
    const exp = await http.get("/v1/me/export").set(me).expect(200);
    expect(exp.body.weeklyEmailSubscription).toEqual([expect.objectContaining({ email: "both@example.com", confirmedAt: null })]);
    await http.delete("/v1/me").set(me).expect(204);
    expect(await row("both@example.com")).toBeUndefined();
  });
});
