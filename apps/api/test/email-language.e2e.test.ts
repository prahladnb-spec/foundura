import type { INestApplication } from "@nestjs/common";
import { sql } from "drizzle-orm";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createDb } from "../src/db/client";
import { DigestService } from "../src/digest/digest.service";
import { TermsReminderService } from "../src/legal/terms-reminder.service";
import { MailerService } from "../src/mail/mailer.service";
import { ADMIN_KEY, DATABASE_URL, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
let mailer: MailerService;

const last = (to: string) => [...mailer.outbox].reverse().find((m) => m.to === to)!;

async function signInAs(email: string, locale?: "en" | "hi", consents = ["account"]) {
  const r1 = await http.post("/v1/auth/request-otp").send({ email, locale }).expect(200);
  const r2 = await http.post("/v1/auth/verify-otp").send({ email, code: r1.body.devCode, consents, locale }).expect(200);
  return { Authorization: `Bearer ${r2.body.token as string}` };
}

beforeAll(async () => {
  ({ app, http } = await startTestApp());
  mailer = app.get(MailerService);
});
afterAll(async () => {
  await app?.close();
});

describe("email language", () => {
  let hindi: Record<string, string>;

  it("sends the sign-in code in the language of the page, and remembers it", async () => {
    hindi = await signInAs("hindi@example.com", "hi", ["account", "scheme_alerts"]);
    expect(last("hindi@example.com").subject).toMatch(/आपका Foundura साइन-इन कोड है/);
    expect((await http.get("/v1/me").set(hindi).expect(200)).body.locale).toBe("hi");

    // Default stays English
    const en = await signInAs("english@example.com");
    expect(last("english@example.com").subject).toMatch(/is your Foundura sign-in code/);
    expect((await http.get("/v1/me").set(en).expect(200)).body.locale).toBe("en");
  });

  it("can be changed on the dashboard, and a code asked for without a language uses the saved one", async () => {
    await http.patch("/v1/me/locale").set(hindi).send({ locale: "fr" }).expect(400);
    await http.patch("/v1/me/locale").set(hindi).send({ locale: "en" }).expect(200);
    expect((await http.get("/v1/me").set(hindi).expect(200)).body.locale).toBe("en");
    await http.patch("/v1/me/locale").set(hindi).send({ locale: "hi" }).expect(200);

    await http.post("/v1/auth/request-otp").send({ email: "hindi@example.com" }).expect(200);
    expect(last("hindi@example.com").subject).toMatch(/साइन-इन कोड/);
  });

  it("sends intro emails in each recipient's language, linking to their language's pages", async () => {
    const investor = await signInAs("nivesh@example.com", "hi");
    const inv = await http
      .post("/v1/me/investor")
      .set(investor)
      .send({
        name: "Kavya Iyer",
        type: "angel",
        bio: "Angel investor backing early medtech founders.",
        sectors: ["medtech"],
        stages: ["prototype"],
        states: [],
        chequeMinInrLakh: 10,
        chequeMaxInrLakh: 50,
      })
      .expect(201);

    const founder = await signInAs("founder-en@example.com", "en", ["account", "investor_visibility"]);
    const st = await http
      .post("/v1/me/startups")
      .set(founder)
      .send({
        name: "Nada Devices",
        oneLiner: "Bone-conduction hearing aids for children",
        description:
          "We make a soft-band bone-conduction hearing aid that costs a fifth of imported devices, fitted by audiologists in district hospitals across Karnataka.",
        website: "https://nada.example.com",
        deckUrl: "https://nada.example.com/deck.pdf",
        entityType: "private_limited",
        dpiitRecognised: true,
        incorporationDate: "2025-01-10",
        state: "KA",
        sectors: ["medtech"],
        stage: "prototype",
        raisingInrLakh: 40,
        isPublic: true,
      })
      .expect(201);
    await http
      .post(`/v1/me/startups/${st.body.id}/intros`)
      .set(founder)
      .send({ investorId: inv.body.id, message: "We are fitting our first 200 children this quarter and would value your view." })
      .expect(201);
    const req = last("nivesh@example.com");
    expect(req.subject).toMatch(/परिचय अनुरोध/);
    expect(req.text).toMatch(/\/hi\/dashboard\/investor/);

    const inbox = await http.get("/v1/me/intros").set(investor).expect(200);
    await http.post(`/v1/me/intros/${inbox.body.received[0].id}/respond`).set(investor).send({ accept: true }).expect(200);
    await new Promise((r) => setTimeout(r, 50));
    const acc = last("founder-en@example.com");
    expect(acc.subject).toMatch(/accepted your intro request/);
    expect(acc.text).toMatch(/localhost:3000\/dashboard/);
  });

  it("sends weekly alerts in Hindi with Hindi links and a working Hindi unsubscribe link", async () => {
    await http
      .post("/v1/me/startups")
      .set(hindi)
      .send({ name: "श्रुति हियरिंग", entityType: "private_limited", dpiitRecognised: true, incorporationDate: "2024-06-01", state: "KA", sectors: ["medtech"], stage: "prototype" })
      .expect(201);
    const r = await app.get(DigestService).run();
    expect(r.sent).toBeGreaterThanOrEqual(1);
    const m = last("hindi@example.com");
    expect(m.subject).toMatch(/^आपका Foundura हफ़्ता/);
    expect(m.text).toContain("आपके लिए नया");
    expect(m.text).toMatch(/localhost:3000\/hi\/schemes\/[a-z0-9-]+/);
    expect(m.text).not.toMatch(/localhost:3000\/schemes\//);
    expect(m.text).toContain("Foundura कभी पैसों का लेन-देन नहीं करता");

    const url = new URL(m.text.match(/ये ईमेल बंद करें: (\S+)/)![1]);
    expect(url.pathname).toBe("/hi/unsubscribe");
    await http.post("/v1/digest/unsubscribe").send({ u: url.searchParams.get("u"), t: url.searchParams.get("t") }).expect(200);
  });

  it("sends the yearly reminder in each person's language", async () => {
    const { db, pool } = createDb(DATABASE_URL);
    await db.execute(sql`update users set created_at = now() - interval '400 days'`);
    await pool.end();
    await app.get(TermsReminderService).run();
    const hi = last("hindi@example.com");
    expect(hi.subject).toMatch(/सालाना याद/);
    expect(hi.text).toMatch(/\/hi\/terms/);
    expect(last("english@example.com").subject).toMatch(/Your yearly reminder/);
  });

  it("lets editors preview the alert email in Hindi", async () => {
    const p = await http.get("/v1/admin/digest/preview?locale=hi").set({ "x-admin-key": ADMIN_KEY }).expect(200);
    expect(p.body.subject).toMatch(/^आपका Foundura हफ़्ता/);
    expect(p.body.text).toContain("/hi/unsubscribe");
    const en = await http.get("/v1/admin/digest/preview").set({ "x-admin-key": ADMIN_KEY }).expect(200);
    expect(en.body.subject).toMatch(/^Your Foundura week/);
  });
});
