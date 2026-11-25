import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { emailHtml, linkify } from "../src/mail/html";
import { LOGO_PNG_BASE64 } from "../src/mail/logo";
import { T } from "../src/mail/templates";

const site = "https://foundura.org";

describe("HTML emails", () => {
  it("carry the same logo as the website", () => {
    const web = readFileSync(join(__dirname, "../../web/public/brand/foundura-logo-email.png"));
    expect(Buffer.from(LOGO_PNG_BASE64, "base64").equals(web)).toBe(true);
  });

  it("escape the text and turn addresses into links, leaving trailing punctuation out", () => {
    expect(linkify("<b> & see https://foundura.org/hi/dashboard.")).toBe(
      '&lt;b&gt; &amp; see <a href="https://foundura.org/hi/dashboard" style="color:#003271;text-decoration:underline;word-break:break-all">https://foundura.org/hi/dashboard</a>.',
    );
  });

  it("make paragraphs, lists and small print from the plain text", () => {
    const html = emailHtml({ subject: "S", text: "Hi,\n\nFirst line\nsecond line\n\n- one\n- two\n\n--\nWhy you get this.", lang: "en", site });
    expect(html).toContain("First line<br>second line");
    expect(html).toMatch(/<ul[^>]*><li[^>]*>one<\/li><li[^>]*>two<\/li><\/ul>/);
    expect(html).toContain("font-size:13px;line-height:1.6;color:#5b6280\">Why you get this.");
    expect(html).not.toContain("--");
    expect(html).toContain('<html lang="en"');
  });

  it("show a sign-in code large, in both languages", () => {
    for (const lang of ["en", "hi"] as const) {
      const mail = T[lang].signIn("482913");
      const html = emailHtml({ ...mail, lang, site });
      expect(html).toContain(`<html lang="${lang}"`);
      expect(html).toMatch(/font-size:30px[^>]*>482913<\/span>/);
    }
  });

  it("load nothing from the web when opened", () => {
    const html = emailHtml({ subject: "S", text: "Hello", lang: "en", site });
    expect(html).not.toMatch(/<img[^>]+src="https?:/);
    expect(html).not.toMatch(/<link|<script|url\(/);
  });
});
