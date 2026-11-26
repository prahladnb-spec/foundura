import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
const tag = Date.now().toString(36);
let visitor = 0;
const login = (email: string) => signIn(http, email, ["account"], `198.51.100.${++visitor}`);

beforeAll(async () => {
  ({ app, http } = await startTestApp({ TRUST_PROXY: "1" }));
});
afterAll(async () => {
  await app?.close();
});

async function makeStartup(name: string) {
  const auth = await login(`${name.toLowerCase().replace(/\W+/g, "-")}@example.com`);
  const r = await http
    .post("/v1/me/startups")
    .set(auth)
    .send({ name, isPublic: false, stage: "prototype", entityType: "private_limited", turnoverInrCr: 2.5, raisingInrLakh: 200, deckUrl: "https://example.com/d.pdf", indianPromoterSharePct: 90, oneLiner: "Soil sensors for small farms" })
    .expect(201);
  return { auth, id: r.body.id as string };
}

describe("progress tracker", () => {
  it("saves the stage and ticked steps, rejects unknown ones, and includes them in the export", async () => {
    const { auth, id } = await makeStartup(`Bhoomi ${tag}`);
    const r = await http.put(`/v1/me/startups/${id}/journey`).set(auth).send({ stage: "setup", done: ["setup.incorporate", "idea.problem", "setup.incorporate"] }).expect(200);
    expect(r.body).toEqual({ stage: "setup", done: ["setup.incorporate", "idea.problem"] });
    await http.put(`/v1/me/startups/${id}/journey`).set(auth).send({ stage: "unicorn", done: [] }).expect(400);
    await http.put(`/v1/me/startups/${id}/journey`).set(auth).send({ stage: null, done: ["setup.hacks"] }).expect(400);

    const other = await login(`someone-else-${tag}@example.com`);
    await http.put(`/v1/me/startups/${id}/journey`).set(other).send({ stage: "idea", done: [] }).expect(403);

    const exp = (await http.get("/v1/me/export").set(auth).expect(200)).body;
    expect(exp.startups[0]).toMatchObject({ journeyStage: "setup", journeyDone: ["setup.incorporate", "idea.problem"] });
  });
});

describe("private profile link", () => {
  it("shows the chosen parts of a private profile, never the figures, and stops working when switched off", async () => {
    const { auth, id } = await makeStartup(`Krishi Labs ${tag}`);
    await http.put(`/v1/me/startups/${id}/journey`).set(auth).send({ stage: "mvp", done: ["mvp.build"] }).expect(200);
    expect((await http.get(`/v1/me/startups/${id}/share`).set(auth).expect(200)).body).toEqual({ active: null });

    await http.post(`/v1/me/startups/${id}/share`).set(auth).send({ showReadiness: true, showProgress: true, days: 5 }).expect(400);
    const made = (await http.post(`/v1/me/startups/${id}/share`).set(auth).send({ showReadiness: true, showProgress: true, days: 30 }).expect(201)).body;
    expect(made.token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const days = (new Date(made.active.expiresAt).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(29.9);
    expect(days).toBeLessThan(30.1);

    const seen = (await http.get(`/v1/shared/${made.token}`).expect(200)).body;
    expect(seen.startup.name).toBe(`Krishi Labs ${tag}`);
    expect(seen.readiness.score).toBeGreaterThan(0);
    expect(seen.progress).toEqual({ stage: "mvp", done: ["mvp.build"] });
    const text = JSON.stringify(seen);
    for (const secret of ["turnover", "raising", "deck", "Promoter", "ownerId", "email", "2.5", "200"]) expect(text).not.toContain(secret);

    // The database keeps only a hash; the export lists the settings but never the token.
    const exp = (await http.get("/v1/me/export").set(auth).expect(200)).body;
    expect(exp.privateProfileLinks).toHaveLength(1);
    expect(JSON.stringify(exp)).not.toContain(made.token);

    // Another person can't see or change it.
    const other = await login(`nosy-${tag}@example.com`);
    await http.get(`/v1/me/startups/${id}/share`).set(other).expect(403);
    await http.delete(`/v1/me/startups/${id}/share`).set(other).expect(403);

    // A new link replaces the old one, and can leave things out.
    const again = (await http.post(`/v1/me/startups/${id}/share`).set(auth).send({ showReadiness: false, showProgress: false, days: 7 }).expect(201)).body;
    await http.get(`/v1/shared/${made.token}`).expect(404);
    const plain = (await http.get(`/v1/shared/${again.token}`).expect(200)).body;
    expect(plain.readiness).toBeNull();
    expect(plain.progress).toBeNull();

    await http.delete(`/v1/me/startups/${id}/share`).set(auth).expect(204);
    await http.get(`/v1/shared/${again.token}`).expect(404);
    await http.get("/v1/shared/not-a-token").expect(404);
  });

  it("goes when the account is deleted", async () => {
    const { auth, id } = await makeStartup(`Gone Soon ${tag}`);
    const made = (await http.post(`/v1/me/startups/${id}/share`).set(auth).send({ showReadiness: false, showProgress: false, days: 7 }).expect(201)).body;
    await http.delete("/v1/me").set(auth).expect(204);
    await http.get(`/v1/shared/${made.token}`).expect(404);
  });
});
