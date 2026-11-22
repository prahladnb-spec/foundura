import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_EMAIL, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
let admin: Record<string, string>;
const tag = Date.now().toString(36);
let visitor = 0;
/** Each sign-in comes from its own address, so the per-IP sign-in limit doesn't trip. */
const login = (email: string) => signIn(http, email, ["account"], `203.0.113.${++visitor}`);

beforeAll(async () => {
  ({ app, http } = await startTestApp({ TRUST_PROXY: "1" }));
  admin = await login(ADMIN_EMAIL);
});
afterAll(async () => {
  await app?.close();
});

const PROFILE = {
  entityType: "private_limited",
  incorporationDate: "2024-08-15",
  state: "KA",
  stage: "prototype",
  sectors: ["medtech"],
  turnoverInrCr: 0.6,
  govtSupportReceivedInrLakh: 12,
  indianPromoterSharePct: 88,
  deckUrl: "https://example.com/deck.pdf",
  raisingInrLakh: 150,
  oneLiner: "Hand-held hearing screener for community health workers",
  description: "We make a low-cost screener that a health worker can use in five minutes.",
  website: "https://shruti.example.com",
  productUrl: "https://shruti.example.com/demo",
  lookingFor: ["pilots", "distributors"],
};

async function makeStartup(name: string, extra: Record<string, unknown> = {}) {
  const auth = await login(`${name.toLowerCase().replace(/\W+/g, "-")}-${tag}@example.com`);
  const r = await http.post("/v1/me/startups").set(auth).send({ ...PROFILE, name, ...extra }).expect(201);
  return { auth, id: r.body.id as string, slug: r.body.slug as string };
}

describe("startup showcase", () => {
  it("lists only public startups and never shows financial figures", async () => {
    const pub = await makeStartup(`Shruti Hearing ${tag}`, { isPublic: true });
    const priv = await makeStartup(`Quiet Labs ${tag}`, { isPublic: false });

    const list = (await http.get("/v1/startups").expect(200)).body as Array<Record<string, unknown>>;
    const names = list.map((s) => s.name);
    expect(names).toContain(`Shruti Hearing ${tag}`);
    expect(names).not.toContain(`Quiet Labs ${tag}`);
    await http.get(`/v1/startups/${priv.slug}`).expect(404);

    const page = (await http.get(`/v1/startups/${pub.slug}`).expect(200)).body;
    expect(page).toMatchObject({
      productUrl: "https://shruti.example.com/demo",
      lookingFor: ["pilots", "distributors"],
      foundedYear: 2024,
      sectors: ["medtech"],
    });
    const body = JSON.stringify([page, list]);
    for (const secret of ["turnover", "raising", "deck", "promoter", "govtSupport", "incorporationDate", "ownerId", "email", "0.6", "150"]) {
      expect(body, secret).not.toContain(secret);
    }
  });

  it("filters by sector, stage, state and what the startup is looking for", async () => {
    await makeStartup(`Kheti Sense ${tag}`, { isPublic: true, sectors: ["agritech"], stage: "early_revenue", state: "MH", lookingFor: ["hiring"] });
    const names = async (q: string) => ((await http.get(`/v1/startups?${q}`).expect(200)).body as Array<{ name: string }>).map((s) => s.name);

    expect(await names("sector=agritech")).toContain(`Kheti Sense ${tag}`);
    expect(await names("sector=agritech")).not.toContain(`Shruti Hearing ${tag}`);
    expect(await names("stage=early_revenue&state=MH")).toContain(`Kheti Sense ${tag}`);
    expect(await names("state=KA")).not.toContain(`Kheti Sense ${tag}`);
    expect(await names("lookingFor=pilots")).toContain(`Shruti Hearing ${tag}`);
    expect(await names("lookingFor=pilots")).not.toContain(`Kheti Sense ${tag}`);
    await http.get("/v1/startups?sector=astrology").expect(400);
  });

  it("turning the public profile off removes it at once", async () => {
    const s = await makeStartup(`Switch Off ${tag}`, { isPublic: true });
    await http.get(`/v1/startups/${s.slug}`).expect(200);
    await http.patch(`/v1/me/startups/${s.id}`).set(s.auth).send({ isPublic: false }).expect(200);
    await http.get(`/v1/startups/${s.slug}`).expect(404);
    const names = ((await http.get("/v1/startups").expect(200)).body as Array<{ name: string }>).map((x) => x.name);
    expect(names).not.toContain(`Switch Off ${tag}`);
  });

  it("rejects script links and unknown looking-for values", async () => {
    const auth = await login(`bad-links-${tag}@example.com`);
    await http.post("/v1/me/startups").set(auth).send({ name: "Bad Link", productUrl: "javascript:alert(1)" }).expect(400);
    await http.post("/v1/me/startups").set(auth).send({ name: "Bad Link", productUrl: "data:text/html,hi" }).expect(400);
    await http.post("/v1/me/startups").set(auth).send({ name: "Bad Link", lookingFor: ["investment"] }).expect(400);
  });

  it("editors can hide a listing; it is audited and the founder's setting is kept", async () => {
    const s = await makeStartup(`Spam Corp ${tag}`, { isPublic: true });
    const founder = await login(`nosy-${tag}@example.com`);
    await http.get("/v1/admin/startups").set(founder).expect(403);

    const listed = (await http.get("/v1/admin/startups").set(admin).expect(200)).body as Array<{ id: string; email: string }>;
    expect(listed.find((x) => x.id === s.id)?.email).toMatch(/^spam-corp-/);

    await http.post(`/v1/admin/startups/${s.id}/showcase`).set(admin).send({ hidden: true }).expect(200);
    await http.get(`/v1/startups/${s.slug}`).expect(404);
    const mine = (await http.get(`/v1/me/startups/${s.id}`).set(s.auth).expect(200)).body;
    expect(mine.isPublic).toBe(true);

    const audit = (await http.get("/v1/admin/audit").set(admin).expect(200)).body as Array<{ action: string; targetId: string }>;
    expect(audit.some((a) => a.action === "startup.hide" && a.targetId === s.id)).toBe(true);

    await http.post(`/v1/admin/startups/${s.id}/showcase`).set(admin).send({ hidden: false }).expect(200);
    await http.get(`/v1/startups/${s.slug}`).expect(200);
  });

  it("the investor documents checklist is private, raises readiness, and is exported", async () => {
    const s = await makeStartup(`Paper Ready ${tag}`, { isPublic: true });
    const score = async () => (await http.get(`/v1/me/startups/${s.id}/readiness`).set(s.auth).expect(200)).body.score as number;
    const before = await score();
    await http.patch(`/v1/me/startups/${s.id}`).set(s.auth).send({ investorDocs: ["pitch-deck", "cap-table", "financial-model", "ip-assignment"] }).expect(200);
    expect(await score()).toBe(before + 5);
    await http.patch(`/v1/me/startups/${s.id}`).set(s.auth).send({ investorDocs: ["tax-returns"] }).expect(400);
    expect(JSON.stringify((await http.get(`/v1/startups/${s.slug}`).expect(200)).body)).not.toContain("investorDocs");
    const data = (await http.get("/v1/me/export").set(s.auth).expect(200)).body;
    expect(data.startups[0].investorDocs).toEqual(["pitch-deck", "cap-table", "financial-model", "ip-assignment"]);
  });

  it("the new fields are in the founder's data export", async () => {
    const s = await makeStartup(`Export Me ${tag}`, { isPublic: true });
    const data = (await http.get("/v1/me/export").set(s.auth).expect(200)).body;
    expect(data.startups[0]).toMatchObject({ productUrl: "https://shruti.example.com/demo", lookingFor: ["pilots", "distributors"] });
  });
});
