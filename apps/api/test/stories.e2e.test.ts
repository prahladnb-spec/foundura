import type { INestApplication } from "@nestjs/common";
import { STORY_CONFIRMATIONS } from "@foundura/shared";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_KEY, signIn, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
const tag = Date.now().toString(36);
let visitor = 0;
const login = (email: string) => signIn(http, email, ["account"], `198.51.101.${++visitor}`);
const admin = { "x-admin-key": ADMIN_KEY };

beforeAll(async () => {
  ({ app, http } = await startTestApp({ TRUST_PROXY: "1" }));
});
afterAll(async () => {
  await app?.close();
});

const para = "We started by visiting farms around Tumakuru every weekend, asking what went wrong in a season. ";
const story = { title: "How we learned to listen to farmers", body: `${para.repeat(4)}\n\n${para.repeat(2)}`, founderName: "Asha Rao", founderRole: "Co-founder", lang: "en" };

describe("founder stories", () => {
  it("publishes only with every confirmation for the exact text, and withdrawing takes it down", async () => {
    const auth = await login(`asha-${tag}@example.com`);
    const id = (await http.post("/v1/me/startups").set(auth).send({ name: `Mitti ${tag}`, isPublic: true, turnoverInrCr: 3.2 }).expect(201)).body.id as string;
    const base = `/v1/me/startups/${id}/story`;

    expect((await http.get(base).set(auth).expect(200)).body).toEqual({ story: null });
    await http.put(base).set(auth).send({ ...story, body: "Too short" }).expect(400);
    const saved = (await http.put(base).set(auth).send(story).expect(200)).body.story;
    expect(saved.status).toBe("draft");

    // Someone else can't read or change it.
    const other = await login(`nosy-${tag}@example.com`);
    await http.get(base).set(other).expect(403);
    await http.post(`${base}/submit`).set(other).send({ confirmations: [...STORY_CONFIRMATIONS] }).expect(403);

    // Every confirmation is needed.
    await http.post(`${base}/submit`).set(auth).send({ confirmations: ["self", "company"] }).expect(400);
    const sub = (await http.post(`${base}/submit`).set(auth).send({ confirmations: [...STORY_CONFIRMATIONS] }).expect(200)).body.story;
    expect(sub.status).toBe("submitted");
    await http.put(base).set(auth).send(story).expect(409);

    // Not public until an editor publishes it.
    await http.get(`/v1/stories/${saved.slug}`).expect(404);
    const queue = (await http.get("/v1/admin/stories").set(admin).expect(200)).body;
    const q = queue.find((s: { id: string }) => s.id === saved.id);
    expect(q.consent).toMatchObject({ action: "given", matchesText: true, confirmations: [...STORY_CONFIRMATIONS] });
    await http.post(`/v1/admin/stories/${saved.id}/publish`).set(admin).expect(200);

    const pub = (await http.get(`/v1/stories/${saved.slug}`).expect(200)).body;
    expect(pub).toMatchObject({ title: story.title, founderName: "Asha Rao", startup: { name: `Mitti ${tag}` } });
    expect(JSON.stringify(pub)).not.toMatch(/turnover|3\.2|email|ownerId/);
    expect((await http.get("/v1/stories").expect(200)).body.some((s: { slug: string }) => s.slug === saved.slug)).toBe(true);

    // Withdrawing removes it at once and is recorded.
    expect((await http.post(`${base}/withdraw`).set(auth).expect(200)).body.story.status).toBe("withdrawn");
    await http.get(`/v1/stories/${saved.slug}`).expect(404);
    await http.post(`/v1/admin/stories/${saved.id}/publish`).set(admin).expect(409);

    // A changed text needs a fresh consent before it can go out again.
    await http.put(base).set(auth).send({ ...story, title: "How we learned to listen to farmers, again" }).expect(200);
    await http.post(`/v1/admin/stories/${saved.id}/publish`).set(admin).expect(409);

    const exp = (await http.get("/v1/me/export").set(auth).expect(200)).body;
    expect(exp.founderStories[0].consentHistory.map((c: { action: string }) => c.action)).toEqual(["given", "withdrawn"]);

    await http.delete(base).set(auth).expect(204);
    expect((await http.get(base).set(auth).expect(200)).body).toEqual({ story: null });
  });

  it("lets an editor send a story back with a note, which the founder sees", async () => {
    const auth = await login(`ravi-${tag}@example.com`);
    const id = (await http.post("/v1/me/startups").set(auth).send({ name: `Jal ${tag}` }).expect(201)).body.id as string;
    const base = `/v1/me/startups/${id}/story`;
    const s = (await http.put(base).set(auth).send({ ...story, founderName: "Ravi K" }).expect(200)).body.story;
    await http.post(`${base}/submit`).set(auth).send({ confirmations: [...STORY_CONFIRMATIONS] }).expect(200);
    await http.post(`/v1/admin/stories/${s.id}/return`).set(admin).send({ note: "Please remove the customer's name in paragraph two." }).expect(200);
    const back = (await http.get(base).set(auth).expect(200)).body.story;
    expect(back).toMatchObject({ status: "returned", editorNote: "Please remove the customer's name in paragraph two." });
    await http.put(base).set(auth).send({ ...story, founderName: "Ravi K" }).expect(200);
    // A private startup's story doesn't link to the profile.
    await http.post(`${base}/submit`).set(auth).send({ confirmations: [...STORY_CONFIRMATIONS] }).expect(200);
    await http.post(`/v1/admin/stories/${s.id}/publish`).set(admin).expect(200);
    expect((await http.get(`/v1/stories/${s.slug}`).expect(200)).body.startup).toEqual({ name: `Jal ${tag}`, slug: null });
  });
});
