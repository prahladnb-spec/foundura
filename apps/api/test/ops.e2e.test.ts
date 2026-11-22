import type { INestApplication } from "@nestjs/common";
import type request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MailerService } from "../src/mail/mailer.service";
import { OpsService } from "../src/ops/ops.service";
import { ADMIN_KEY, startTestApp } from "./helpers";

const TOKEN = "web-report-token-0123456789abcdef";
let app: INestApplication;
let http: ReturnType<typeof request>;
let ops: OpsService;
let outbox: { to: string; subject: string; text: string }[];

beforeAll(async () => {
  ({ app, http } = await startTestApp({ OPS_ALERT_EMAIL: "ops@foundura.test", OPS_REPORT_TOKEN: TOKEN, SCHEDULED_EMAILS: "true", EVENT_SYNC: "true" }));
  ops = app.get(OpsService);
  outbox = app.get(MailerService).outbox;
});
afterAll(async () => {
  await app?.close();
});
const alerts = () => outbox.filter((m) => m.to === "ops@foundura.test");

describe("alerts", () => {
  it("emails once per 30 minutes for the same problem", async () => {
    const t = Date.parse("2027-01-01T00:00:00Z");
    expect(await ops.alert("Test problem", "first", "k1", t)).toBe(true);
    expect(await ops.alert("Test problem", "again", "k1", t + 10 * 60_000)).toBe(false);
    expect(await ops.alert("Test problem", "later", "k1", t + 31 * 60_000)).toBe(true);
    expect(alerts().filter((m) => m.subject === "[Foundura alert] Test problem")).toHaveLength(2);
  });

  it("expected errors aren't reported; unexpected ones are, without query strings", async () => {
    const before = alerts().length;
    await http.get("/v1/schemes/no-such-scheme").expect(404);
    await http.post("/v1/auth/request-otp").send({ email: "not-an-email" }).expect(400);
    expect(alerts()).toHaveLength(before);

    // A job that throws is an unexpected failure.
    await ops.track("event_sync", async () => {
      throw new Error("Network unreachable");
    });
    const failed = alerts().find((m) => m.subject === "[Foundura alert] Scheduled job failed: event_sync")!;
    expect(failed.text).toContain("Network unreachable");
  });

  it("records job runs and flags jobs that have stopped", async () => {
    await ops.track("weekly_digest", async () => ({ failed: 0 }));
    await ops.track("terms_reminder", async () => ({ failed: 0 }));
    const soon = await ops.staleJobs(new Date(Date.now() + 60 * 60_000));
    // event_sync failed above and has never succeeded, but the server has only just started.
    expect(soon.map((j) => j.name)).toEqual([]);
    const later = await ops.staleJobs(new Date(Date.now() + 3 * 24 * 3_600_000));
    expect(later.map((j) => j.name).sort()).toEqual(["event_sync", "terms_reminder"]);
    await ops.checkStale(new Date(Date.now() + 3 * 24 * 3_600_000));
    expect(alerts().some((m) => m.subject === "[Foundura alert] Scheduled job has stopped: terms_reminder")).toBe(true);
  });

  it("a job whose result says it failed is reported", async () => {
    await ops.track("weekly_digest", async () => ({ failed: 3 }), (r) => (r.failed ? `${r.failed} digest emails failed to send` : null));
    expect(alerts().some((m) => m.subject.endsWith("Scheduled job failed: weekly_digest") && m.text.includes("3 digest emails failed"))).toBe(true);
  });
});

describe("web error reports", () => {
  const report = { source: "web", message: "Cannot read properties of undefined", path: "/dashboard", digest: "12345" };

  it("needs the shared token", async () => {
    await http.post("/v1/ops/report").send(report).expect(401);
    await http.post("/v1/ops/report").set("x-ops-token", "wrong-token-wrong-token-wrong").send(report).expect(401);
    await http.post("/v1/ops/report").set("x-admin-key", ADMIN_KEY).send(report).expect(401);
  });

  it("accepts a report and emails it", async () => {
    await http.post("/v1/ops/report").set("x-ops-token", TOKEN).send(report).expect(202);
    const m = alerts().find((x) => x.subject === "[Foundura alert] Web error: Cannot read properties of undefined")!;
    expect(m.text).toContain("/dashboard (digest 12345)");
    await http.post("/v1/ops/report").set("x-ops-token", TOKEN).send({ ...report, source: "api" }).expect(400);
  });
});

describe("error filter", async () => {
  const { AlertingExceptionFilter } = await import("../src/ops/alerting-exception.filter");
  const { NotFoundException } = await import("@nestjs/common");
  const host = (path: string) =>
    ({ switchToHttp: () => ({ getRequest: () => ({ method: "GET", path }), getResponse: () => ({}) }), getArgByIndex: () => ({}), getArgs: () => [], getType: () => "http" }) as never;
  const adapter = { reply: () => {}, isHeadersSent: () => false, end: () => {} } as never;

  it("reports unexpected errors by method and path only, and leaves expected ones alone", () => {
    const seen: string[] = [];
    const filter = new AlertingExceptionFilter({ alert: async (s: string, d: string) => void seen.push(`${s} | ${d.split("\n")[0]}`) } as never, adapter);
    filter.catch(new NotFoundException(), host("/v1/x"));
    filter.catch(new TypeError("boom"), host("/v1/me/startups"));
    expect(seen).toEqual(["API error: boom | GET /v1/me/startups"]);
  });
});
