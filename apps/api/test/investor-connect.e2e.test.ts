import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;

beforeAll(async () => {
  ({ app, http } = await startTestApp());
});
afterAll(async () => {
  await app?.close();
});

const INVESTOR = {
  name: "Asha Rao",
  firm: "Kaveri Health Angels",
  type: "angel_network",
  bio: "Early-stage health and medtech investors in South India.",
  sectors: ["medtech", "healthtech"],
  stages: ["prototype", "early_revenue"],
  states: [],
  chequeMinInrLakh: 25,
  chequeMaxInrLakh: 100,
};

const READY_STARTUP = {
  name: "Shruti Hearing",
  oneLiner: "Low-cost hearing screening for rural clinics",
  description:
    "We build a hand-held hearing screener that community health workers can use in under five minutes, with results synced to district hospitals for follow-up.",
  website: "https://shruti.example.com",
  deckUrl: "https://shruti.example.com/deck.pdf",
  entityType: "private_limited",
  dpiitRecognised: true,
  incorporationDate: "2025-03-01",
  state: "KA",
  sectors: ["medtech"],
  stage: "prototype",
  raisingInrLakh: 150,
  turnoverInrCr: 0.2,
  isPublic: true,
};

describe("Investor Connect", () => {
  let investorAuth: Record<string, string>;
  let founderAuth: Record<string, string>;
  let investorId: string;
  let investorSlug: string;
  let startupId: string;

  it("lets an investor create a listed profile that appears in the public directory", async () => {
    investorAuth = await signIn(http, "asha@example.com");
    const r = await http.post("/v1/me/investor").set(investorAuth).send(INVESTOR).expect(201);
    investorId = r.body.id;
    investorSlug = r.body.slug;
    await http.post("/v1/me/investor").set(investorAuth).send(INVESTOR).expect(409);

    const dir = await http.get("/v1/investors?sector=medtech").expect(200);
    expect(dir.body.map((i: { slug: string }) => i.slug)).toContain(investorSlug);
    expect(dir.body[0].ownerId).toBeUndefined();
    const none = await http.get("/v1/investors?sector=fintech").expect(200);
    expect(none.body).toHaveLength(0);
  });

  it("validates investor profiles", async () => {
    const auth = await signIn(http, "bad-investor@example.com");
    await http.post("/v1/me/investor").set(auth).send({ ...INVESTOR, chequeMaxInrLakh: 1 }).expect(400);
  });

  it("scores readiness with a fix list and blocks intros below the threshold", async () => {
    founderAuth = await signIn(http, "founder@example.com");
    const s = await http
      .post("/v1/me/startups")
      .set(founderAuth)
      .send({ name: "Shruti Hearing", sectors: ["medtech"], stage: "prototype" })
      .expect(201);
    startupId = s.body.id;

    const low = await http.get(`/v1/me/startups/${startupId}/readiness`).set(founderAuth).expect(200);
    expect(low.body.score).toBeLessThan(50);
    expect(low.body.items.find((i: { key: string }) => i.key === "deck").fix).toBeTruthy();

    const blocked = await http
      .post(`/v1/me/startups/${startupId}/intros`)
      .set(founderAuth)
      .send({ investorId, message: "We are building hearing screening for rural India and would value your advice." })
      .expect(403);
    expect(blocked.body.message).toMatch(/readiness score/);
  });

  it("ranks investors for the startup with reasons", async () => {
    await http.patch(`/v1/me/startups/${startupId}`).set(founderAuth).send(READY_STARTUP).expect(200);
    await http.post("/v1/me/consents").set(founderAuth).send({ purpose: "investor_visibility", granted: true }).expect(200);

    const ready = await http.get(`/v1/me/startups/${startupId}/readiness`).set(founderAuth).expect(200);
    expect(ready.body.score).toBe(93); // prototype stage: 8 of 15 traction points

    const m = await http.get(`/v1/me/startups/${startupId}/investor-matches`).set(founderAuth).expect(200);
    expect(m.body[0].investor.id).toBe(investorId);
    expect(m.body[0].match.score).toBe(100);
    expect(m.body[0].introStatus).toBeNull();
  });

  it("shows consenting public startups to the investor, without private figures", async () => {
    const m = await http.get("/v1/me/investor/matches").set(investorAuth).expect(200);
    expect(m.body).toHaveLength(1);
    expect(m.body[0].startup.name).toBe("Shruti Hearing");
    expect(m.body[0].startup.turnoverInrCr).toBeUndefined();
    expect(m.body[0].startup.raisingInrLakh).toBeUndefined();
    expect(m.body[0].startup.deckUrl).toBeUndefined();

    // Withdrawing consent hides the startup from investors
    await http.post("/v1/me/consents").set(founderAuth).send({ purpose: "investor_visibility", granted: false }).expect(200);
    const hidden = await http.get("/v1/me/investor/matches").set(investorAuth).expect(200);
    expect(hidden.body).toHaveLength(0);
    await http.post("/v1/me/consents").set(founderAuth).send({ purpose: "investor_visibility", granted: true }).expect(200);
  });

  let introId: string;

  it("sends an intro request; duplicates are refused; emails stay hidden until accepted", async () => {
    const msg = "We are building low-cost hearing screening for rural clinics and are raising our first round.";
    const r = await http.post(`/v1/me/startups/${startupId}/intros`).set(founderAuth).send({ investorId, message: msg }).expect(201);
    introId = r.body.id;
    await http.post(`/v1/me/startups/${startupId}/intros`).set(founderAuth).send({ investorId, message: msg }).expect(409);

    const inbox = await http.get("/v1/me/intros").set(investorAuth).expect(200);
    expect(inbox.body.received).toHaveLength(1);
    expect(inbox.body.received[0].startup.deckUrl).toBe(READY_STARTUP.deckUrl);
    expect(inbox.body.received[0].startup.raisingInrLakh).toBe(150);
    expect(inbox.body.received[0].contactEmail).toBeNull();

    const sent = await http.get("/v1/me/intros").set(founderAuth).expect(200);
    expect(sent.body.sent[0].contactEmail).toBeNull();
    expect(sent.body.sent[0].status).toBe("pending");
  });

  it("only the investor can respond; acceptance reveals both emails", async () => {
    await http.post(`/v1/me/intros/${introId}/respond`).set(founderAuth).send({ accept: true }).expect(404);
    await http.post(`/v1/me/intros/${introId}/respond`).set(investorAuth).send({ accept: true }).expect(200);
    await http.post(`/v1/me/intros/${introId}/respond`).set(investorAuth).send({ accept: false }).expect(409);

    const inv = await http.get("/v1/me/intros").set(investorAuth).expect(200);
    expect(inv.body.received[0].contactEmail).toBe("founder@example.com");
    const fnd = await http.get("/v1/me/intros").set(founderAuth).expect(200);
    expect(fnd.body.sent[0].contactEmail).toBe("asha@example.com");
    await http.post(`/v1/me/intros/${introId}/withdraw`).set(founderAuth).expect(409);
  });

  it("refuses intros when the focus doesn't match", async () => {
    const otherAuth = await signIn(http, "fintech-vc@example.com");
    const other = await http
      .post("/v1/me/investor")
      .set(otherAuth)
      .send({ ...INVESTOR, name: "Ledger Capital", firm: "Ledger Capital", sectors: ["fintech"], stages: ["growth"], states: ["MH"] })
      .expect(201);
    await http
      .post(`/v1/me/startups/${startupId}/intros`)
      .set(founderAuth)
      .send({ investorId: other.body.id, message: "We are building hearing screening and would love to talk about our round." })
      .expect(403);
  });

  it("includes investor data and intros in the export, and erasure removes them", async () => {
    const exp = await http.get("/v1/me/export").set(investorAuth).expect(200);
    expect(exp.body.investorProfile.name).toBe("Asha Rao");
    expect(exp.body.introRequests.received).toHaveLength(1);

    await http.delete("/v1/me").set(investorAuth).expect(204);
    await http.get(`/v1/investors/${investorSlug}`).expect(404);
    const fnd = await http.get("/v1/me/intros").set(founderAuth).expect(200);
    expect(fnd.body.sent).toHaveLength(0); // cascaded with the investor profile
  });
});
