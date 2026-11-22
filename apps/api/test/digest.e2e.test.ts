import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { todayInIndia } from "../src/common/zod";
import { DigestService, weekOf } from "../src/digest/digest.service";
import { type Mail, MailerService } from "../src/mail/mailer.service";
import { ADMIN_EMAIL, ADMIN_KEY, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
let mailer: MailerService;
let digest: DigestService;

const DAY = 86_400_000;
const plus = (iso: string, n: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const ddmmyyyy = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
const today = todayInIndia();
const nextWeek = plus(today, 7);

const mailsTo = (to: string) => mailer.outbox.filter((m) => m.to === to && m.subject.startsWith("Your Foundura week"));
const linkParams = (m: Mail) => {
  const url = new URL(m.text.match(/Stop these emails: (\S+)/)![1]);
  return { u: url.searchParams.get("u")!, t: url.searchParams.get("t")! };
};

let founder: Record<string, string>;

beforeAll(async () => {
  ({ app, http } = await startTestApp());
  mailer = app.get(MailerService);
  digest = app.get(DigestService);
});
afterAll(async () => {
  await app?.close();
});

describe("weekly scheme alerts", () => {
  it("computes the Monday of a week", () => {
    expect(weekOf("2026-11-22")).toBe("2026-11-16"); // Sunday
    expect(weekOf("2026-11-23")).toBe("2026-11-23"); // Monday
    expect(weekOf("2026-11-25")).toBe("2026-11-23");
  });

  it("emails only people who opted in, and only when there's something new", async () => {
    founder = await signIn(http, "alerts@example.com", ["account", "scheme_alerts"]);
    await http
      .post("/v1/me/startups")
      .set(founder)
      .send({
        name: "Shruti Hearing",
        entityType: "private_limited",
        dpiitRecognised: true,
        incorporationDate: "2024-06-01",
        state: "KA",
        sectors: ["medtech"],
        stage: "prototype",
        turnoverInrCr: 0.4,
      })
      .expect(201);
    await signIn(http, "no-alerts@example.com"); // never opted in
    await signIn(http, "no-profile@example.com", ["account", "scheme_alerts"]); // opted in, no startup yet

    const r = await http.post("/v1/admin/digest/send").set({ "x-admin-key": ADMIN_KEY }).expect(200);
    expect(r.body).toMatchObject({ recipients: 2, sent: 1, nothingNew: 1, failed: 0 });

    const [m] = mailsTo("alerts@example.com");
    expect(m.subject).toMatch(/schemes? (you qualify for|worth checking)/);
    expect(m.text).toContain("Shruti Hearing");
    expect(m.text).toMatch(/\/schemes\/dpiit-startup-recognition/);
    expect(m.text).not.toMatch(/0\.4|turnover/i);
    expect(m.headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
    expect(mailsTo("no-alerts@example.com")).toHaveLength(0);
    expect(mailsTo("no-profile@example.com")).toHaveLength(0);
  });

  it("sends at most once a week", async () => {
    const r = await http.post("/v1/admin/digest/send").set({ "x-admin-key": ADMIN_KEY }).expect(200);
    expect(r.body).toMatchObject({ sent: 0, alreadySent: 1 });
    expect(mailsTo("alerts@example.com")).toHaveLength(1);
  });

  it("next week reports updated schemes and upcoming deadlines, not the same schemes again", async () => {
    await http.post("/v1/admin/schemes/dpiit-startup-recognition/verify").set({ "x-admin-key": ADMIN_KEY }).expect(200);
    const csv =
      "Event,Start,End,City / venue,Country,Scope,Type,Status,Key deadline,Best for,Cost & notes,Source,Last checked\n" +
      `MedTech Demo Day,${ddmmyyyy(plus(nextWeek, 20))},,Bengaluru,India,India,Demo day,Confirmed,${ddmmyyyy(plus(nextWeek, 5))},Medtech founders,Free,[Organiser](https://example.com/demo),${ddmmyyyy(today)}\n`;
    await http.post("/v1/admin/import/events").set({ "Content-Type": "text/csv", "x-admin-key": ADMIN_KEY }).send(csv).expect(200);

    const r = await digest.run(nextWeek);
    expect(r).toMatchObject({ sent: 2, failed: 0 });

    const m = mailsTo("alerts@example.com")[1];
    expect(m.text).not.toContain("New for you");
    expect(m.text).toContain("Updated since last week");
    expect(m.text).toMatch(/DPIIT Startup Recognition: details checked on/);
    expect(m.text).toMatch(/MedTech Demo Day: apply by/);

    const c = mailsTo("no-profile@example.com")[0];
    expect(c.text).toContain("Add your startup profile");
    expect(c.text).toContain("MedTech Demo Day");
  });

  it("unsubscribes with one click and records it in the consent ledger", async () => {
    const m = mailsTo("alerts@example.com")[0];
    const { u, t } = linkParams(m);
    await http.post("/v1/digest/unsubscribe").send({ u, t: `${t.slice(0, -2)}xx` }).expect(400);
    await http.post("/v1/digest/unsubscribe").send({ u, t }).expect(200);
    await http.post("/v1/digest/unsubscribe").send({ u, t }).expect(200); // repeat is harmless

    const consents = await http.get("/v1/me/consents").set(founder).expect(200);
    const alerts = (consents.body as { purpose: string; granted: boolean }[]).find((c) => c.purpose === "scheme_alerts");
    expect(alerts?.granted).toBe(false);

    const exp = await http.get("/v1/me/export").set(founder).expect(200);
    const ledger = exp.body.consentHistory.filter((c: { purpose: string }) => c.purpose === "scheme_alerts");
    expect(ledger.map((c: { granted: boolean }) => c.granted)).toEqual([true, false]);
    expect(exp.body.schemeAlertsSent).toHaveLength(2);
    expect(exp.body.schemeAlertsSent[0].schemes.length).toBeGreaterThan(0);

    // Mail apps' one-click POST carries the parameters in the query string.
    const other = linkParams(mailsTo("no-profile@example.com")[0]);
    await http.post(`/v1/digest/unsubscribe?u=${other.u}&t=${other.t}`).type("form").send("List-Unsubscribe=One-Click").expect(200);

    const r = await digest.run(plus(nextWeek, 7));
    expect(r.recipients).toBe(0);
  });

  it("lets editors preview without exposing anyone's data", async () => {
    const admin = await signIn(http, ADMIN_EMAIL);
    const p = await http.get("/v1/admin/digest/preview").set(admin).expect(200);
    expect(p.body.basedOn).toMatch(/sample/);
    expect(p.body.text).toContain("Sample startup");
    expect(p.body.text).not.toContain("Shruti Hearing");
    await http.get("/v1/admin/digest/preview").set(founder).expect(403);
  });
});
