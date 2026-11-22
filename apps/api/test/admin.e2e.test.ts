import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MailerService } from "../src/mail/mailer.service";
import { ADMIN_EMAIL, ADMIN_KEY, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
let mailer: MailerService;
let admin: Record<string, string>;

beforeAll(async () => {
  ({ app, http } = await startTestApp());
  mailer = app.get(MailerService);
  admin = await signIn(http, ADMIN_EMAIL.toUpperCase()); // case-insensitive allowlist
});
afterAll(async () => {
  await app?.close();
});

const ARTICLE = {
  title: "How to price your first pilot",
  slug: "price-your-first-pilot",
  theme: "Growth Friday",
  excerpt: "A simple way to put a number on a pilot without underselling the work.",
  body: "Pricing a pilot is mostly about making the buyer's decision easy. ".repeat(40),
  publishedAt: null as string | null,
};

describe("admin access", () => {
  it("refuses anonymous users and non-admins, accepts admins and the API key", async () => {
    await http.get("/v1/admin/overview").expect(401);
    const founder = await signIn(http, "someone@example.com");
    await http.get("/v1/admin/overview").set(founder).expect(403);
    await http.get("/v1/admin/overview").set({ "x-admin-key": "wrong-key-wrong-key" }).expect(401);
    await http.get("/v1/admin/overview").set({ "x-admin-key": ADMIN_KEY }).expect(200);
    const r = await http.get("/v1/admin/overview").set(admin).expect(200);
    expect(r.body.schemes).toBeGreaterThan(10);
    expect(r.body.unverifiedSchemes).toBe(r.body.schemes);
  });

  it("sends sign-in codes through the mailer", () => {
    expect(mailer.outbox.some((m) => m.to === ADMIN_EMAIL && /sign-in code/.test(m.subject))).toBe(true);
  });
});

describe("scheme editing", () => {
  it("rejects rules that test a fact the scan doesn't collect", async () => {
    const s = (await http.get("/v1/admin/schemes/dpiit-startup-recognition").set(admin).expect(200)).body;
    const bad = { ...s, rule: { fact: "religion", op: "eq", value: "x", label: "Not allowed" } };
    await http.put("/v1/admin/schemes/dpiit-startup-recognition").set(admin).send(bad).expect(400);

    const check = await http
      .post("/v1/admin/rules/validate")
      .set(admin)
      .send({ fact: "ageYears", op: "lte", value: "ten", label: "Age" })
      .expect(200);
    expect(check.body.ok).toBe(false);
    expect(check.body.issues[0].message).toMatch(/number/);
  });

  it("marks a scheme verified, and an edit without re-checking clears the date", async () => {
    const v = await http.post("/v1/admin/schemes/dpiit-startup-recognition/verify").set(admin).expect(200);
    expect(v.body.lastVerifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const pub = await http.get("/v1/schemes/dpiit-startup-recognition").expect(200);
    expect(pub.body.lastVerifiedAt).toBe(v.body.lastVerifiedAt);

    const s = (await http.get("/v1/admin/schemes/dpiit-startup-recognition").set(admin).expect(200)).body;
    const edited = await http
      .put("/v1/admin/schemes/dpiit-startup-recognition")
      .set(admin)
      .send({ ...s, summary: `${s.summary} Updated.` })
      .expect(200);
    expect(edited.body.lastVerifiedAt).toBeNull();

    const again = await http
      .put("/v1/admin/schemes/dpiit-startup-recognition")
      .set(admin)
      .send({ ...s, markVerified: true })
      .expect(200);
    expect(again.body.lastVerifiedAt).not.toBeNull();
  });

  it("creates new schemes unverified", async () => {
    const s = (await http.get("/v1/admin/schemes/dpiit-startup-recognition").set(admin).expect(200)).body;
    const body = { ...s, slug: "test-state-grant", name: "Test state grant", level: "state", state: "KA", category: "grant" };
    delete body.lastVerifiedAt;
    const r = await http.post("/v1/admin/schemes").set(admin).send(body).expect(201);
    expect(r.body.lastVerifiedAt).toBeNull();
    await http.post("/v1/admin/schemes").set(admin).send(body).expect(409);
    await http.post("/v1/admin/schemes").set(admin).send({ ...body, slug: "no-state", state: null }).expect(400);
  });
});

describe("articles", () => {
  it("keeps drafts private and publishes on demand", async () => {
    const d = await http.post("/v1/admin/articles").set(admin).send(ARTICLE).expect(201);
    expect(d.body.readMinutes).toBe(2);
    let list = await http.get("/v1/articles").expect(200);
    expect(list.body.map((a: { slug: string }) => a.slug)).not.toContain(ARTICLE.slug);

    await http
      .put(`/v1/admin/articles/${ARTICLE.slug}`)
      .set(admin)
      .send({ ...ARTICLE, publishedAt: "2026-11-01" })
      .expect(200);
    list = await http.get("/v1/articles").expect(200);
    expect(list.body.map((a: { slug: string }) => a.slug)).toContain(ARTICLE.slug);
    await http.get(`/v1/articles/${ARTICLE.slug}`).expect(200);

    await http.post("/v1/admin/articles").set(admin).send(ARTICLE).expect(409);
    await http.post("/v1/admin/articles").set(admin).send({ ...ARTICLE, slug: "Bad Slug" }).expect(400);
  });
});

describe("investor review and notifications", () => {
  it("verifies and unlists investors, and emails both sides about intros", async () => {
    const inv = await signIn(http, "kiran@example.com");
    await http
      .post("/v1/me/investor")
      .set(inv)
      .send({
        name: "Kiran Shah",
        type: "angel",
        bio: "Angel investor backing early hardware founders.",
        sectors: ["medtech"],
        stages: ["prototype"],
        states: [],
        chequeMinInrLakh: 10,
        chequeMaxInrLakh: 50,
      })
      .expect(201);

    const list = await http.get("/v1/admin/investors").set(admin).expect(200);
    const row = list.body.find((i: { email: string }) => i.email === "kiran@example.com");
    expect(row.verifiedAt).toBeNull();
    const v = await http.post(`/v1/admin/investors/${row.id}/verify`).set(admin).send({ verified: true }).expect(200);
    expect(v.body.verifiedAt).not.toBeNull();

    // Founder with a ready profile requests an intro; investor gets an email.
    const founder = await signIn(http, "meera@example.com", ["account", "investor_visibility"]);
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
        turnoverInrCr: 0.1,
        isPublic: true,
      })
      .expect(201);
    const sent = mailer.outbox.length;
    await http
      .post(`/v1/me/startups/${st.body.id}/intros`)
      .set(founder)
      .send({
        investorId: row.id,
        message: "We are fitting our first 200 children this quarter and would value your view on the next round.",
      })
      .expect(201);
    const toInvestor = mailer.outbox.slice(sent).find((m) => m.to === "kiran@example.com");
    expect(toInvestor?.subject).toMatch(/Nada Devices/);
    expect(toInvestor?.text).not.toMatch(/meera@example.com/);

    const inbox = await http.get("/v1/me/intros").set(inv).expect(200);
    const introId = inbox.body.received[0].id;
    await http.post(`/v1/me/intros/${introId}/respond`).set(inv).send({ accept: true }).expect(200);
    await new Promise((r) => setTimeout(r, 50));
    const toFounder = mailer.outbox.find((m) => m.to === "meera@example.com" && /accepted/.test(m.subject));
    expect(toFounder).toBeDefined();

    await http.post(`/v1/admin/investors/${row.id}/listing`).set(admin).send({ isListed: false }).expect(200);
    const dir = await http.get("/v1/investors").expect(200);
    expect(dir.body.map((i: { name: string }) => i.name)).not.toContain("Kiran Shah");
  });
});

describe("audit log", () => {
  it("records admin actions without storing emails", async () => {
    const r = await http.get("/v1/admin/audit").set(admin).expect(200);
    const actions = r.body.map((e: { action: string }) => e.action);
    for (const a of ["scheme.verify", "scheme.edit", "scheme.edit_verify", "scheme.create", "article.draft", "article.publish", "investor.verify", "investor.unlist"]) {
      expect(actions).toContain(a);
    }
    expect(JSON.stringify(r.body)).not.toMatch(/@/);
    expect(r.body.every((e: { actorLabel: string }) => e.actorLabel === "admin")).toBe(true);
  });
});
