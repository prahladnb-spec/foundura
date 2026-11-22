import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ADMIN_KEY, startTestApp } from "./helpers";

let app: INestApplication;
let http: ReturnType<typeof request>;
const admin = { "x-admin-key": ADMIN_KEY };
const SLUG = "dpiit-startup-recognition";

beforeAll(async () => {
  ({ app, http } = await startTestApp());
});
afterAll(async () => {
  await app?.close();
});

describe("Hindi scheme text", () => {
  it("serves Hindi when asked, English otherwise, and says which", async () => {
    const hi = (await http.get(`/v1/schemes/${SLUG}?lang=hi`).expect(200)).body;
    expect(hi.name).toBe("DPIIT स्टार्टअप मान्यता");
    expect(hi.contentLang).toBe("hi");
    expect(hi.translations).toBeUndefined();
    const en = (await http.get(`/v1/schemes/${SLUG}`).expect(200)).body;
    expect(en.name).toBe("DPIIT Startup Recognition");
    expect(en.contentLang).toBe("en");
    const list = (await http.get("/v1/schemes?lang=hi").expect(200)).body;
    expect(list.every((s: { contentLang: string }) => s.contentLang === "hi")).toBe(true);
  });

  it("translates scan results, including the condition lines", async () => {
    const r = await http
      .post("/v1/scan?lang=hi")
      .send({ entityType: "private_limited", incorporationDate: "2025-01-01", turnoverInrCr: 1, state: "KA" })
      .expect(200);
    const m = r.body.matches.find((x: { scheme: { slug: string } }) => x.scheme.slug === SLUG);
    expect(m.scheme.name).toBe("DPIIT स्टार्टअप मान्यता");
    expect(m.met).toContain("प्राइवेट लिमिटेड कंपनी, LLP, पार्टनरशिप फ़र्म या सहकारी समिति के रूप में पंजीकृत");
    expect(m.status).toBe("eligible");
    const en = await http.post("/v1/scan").send({ entityType: "private_limited" }).expect(200);
    expect(en.body.matches.find((x: { scheme: { slug: string } }) => x.scheme.slug === SLUG).scheme.name).toBe("DPIIT Startup Recognition");
  });

  it("falls back to English when the English changes, until the Hindi is updated", async () => {
    let s = (await http.get(`/v1/admin/schemes/${SLUG}`).set(admin).expect(200)).body;
    expect(s.hi.status).toBe("current");
    expect(s.hi.labels).toHaveLength(3);

    const { hi: _h, translations: _t, id: _i, createdAt: _c, updatedAt: _u, lastVerifiedAt: _l, slug: _s, level: _lv, state: _st, category: _ca, ...english } = s;
    await http.put(`/v1/admin/schemes/${SLUG}`).set(admin).send({ ...english, summary: `${english.summary} Updated.` }).expect(200);

    s = (await http.get(`/v1/admin/schemes/${SLUG}`).set(admin).expect(200)).body;
    expect(s.hi.status).toBe("outdated");
    const list = (await http.get("/v1/admin/schemes").set(admin).expect(200)).body;
    expect(list.find((x: { slug: string }) => x.slug === SLUG).hiStatus).toBe("outdated");
    const pub = (await http.get(`/v1/schemes/${SLUG}?lang=hi`).expect(200)).body;
    expect(pub.contentLang).toBe("en");
    expect(pub.summary).toMatch(/Updated\.$/);

    const hiText = s.translations.hi;
    const incomplete = { ...hiText, labels: { [s.hi.labels[0]]: "केवल एक" } };
    const bad = await http.put(`/v1/admin/schemes/${SLUG}/translations/hi`).set(admin).send(incomplete).expect(400);
    expect(bad.body.missing).toHaveLength(2);

    const { sourceHash: _sh, updatedAt: _up, ...draft } = hiText;
    await http
      .put(`/v1/admin/schemes/${SLUG}/translations/hi`)
      .set(admin)
      .send({ ...draft, summary: `${draft.summary} अपडेट किया गया।` })
      .expect(200);
    const again = (await http.get(`/v1/schemes/${SLUG}?lang=hi`).expect(200)).body;
    expect(again.contentLang).toBe("hi");
    expect(again.summary).toMatch(/अपडेट किया गया।$/);

    const audit = (await http.get("/v1/admin/audit").set(admin).expect(200)).body;
    expect(audit.map((a: { action: string }) => a.action)).toContain("scheme.translate_hi");
  });
});
