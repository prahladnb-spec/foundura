import { afterEach, describe, expect, it, vi } from "vitest";
import { loadConfig } from "../src/config";
import { LOGO_CID, LOGO_PNG_BASE64 } from "../src/mail/logo";
import { MailerService, parseAddress } from "../src/mail/mailer.service";

const base = { DATABASE_URL: "postgresql://u:p@localhost:5432/x", JWT_SECRET: "x".repeat(32), ADMIN_API_KEY: "y".repeat(24) };

describe("mailer (ZeptoMail)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("parses sender addresses with and without a name", () => {
    expect(parseAddress("Foundura <login@foundura.org>")).toEqual({ address: "login@foundura.org", name: "Foundura" });
    expect(parseAddress('"Foundura alerts" <alerts@foundura.org>')).toEqual({ address: "alerts@foundura.org", name: "Foundura alerts" });
    expect(parseAddress("login@foundura.org")).toEqual({ address: "login@foundura.org" });
  });

  it("sends through ZeptoMail's India endpoint with the token, plain text, HTML and our headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    const mailer = new MailerService(
      loadConfig({ ...base, OTP_DELIVERY: "email", ZEPTOMAIL_TOKEN: "Zoho-enczapikey abc123", OTP_FROM_EMAIL: "Foundura <login@foundura.org>" }),
    );
    await mailer.send({ to: "founder@example.in", subject: "Your code", text: "123456", headers: { "List-Unsubscribe": "<https://foundura.org/u>" } });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.zeptomail.in/v1.1/email");
    expect(init.headers.Authorization).toBe("Zoho-enczapikey abc123"); // prefix not doubled
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({
      from: { address: "login@foundura.org", name: "Foundura" },
      to: [{ email_address: { address: "founder@example.in" } }],
      subject: "Your code",
      textbody: "123456",
      mime_headers: { "List-Unsubscribe": "<https://foundura.org/u>" },
    });
    expect(body.htmlbody).toContain("123456");
    expect(body.htmlbody).toContain(`src="cid:${LOGO_CID}"`);
    expect(body.inline_images).toEqual([{ mime_type: "image/png", content: LOGO_PNG_BASE64, cid: LOGO_CID }]);
  });

  it("throws when ZeptoMail refuses the message, so callers can report it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })));
    const mailer = new MailerService(loadConfig({ ...base, OTP_DELIVERY: "email", ZEPTOMAIL_TOKEN: "t" }));
    await expect(mailer.send({ to: "a@b.in", subject: "s", text: "t" })).rejects.toThrow(/401/);
  });

  it("sends nothing in dev mode", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const mailer = new MailerService(loadConfig({ ...base, OTP_DELIVERY: "dev" }));
    await mailer.send({ to: "a@b.in", subject: "s", text: "t" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mailer.outbox).toHaveLength(1);
  });
});
