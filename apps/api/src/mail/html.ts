import { LOGO_CID } from "./logo";

/**
 * The HTML version of every email, built from its plain text so the two always say the same thing.
 *
 * Text rules: blank lines separate paragraphs; a paragraph whose lines all start with "- " is a list;
 * a line that is just "--" starts the small print at the bottom; web addresses become links.
 * Layout is a single centred column in tables and inline styles, which every mail app understands.
 * The logo is an inline image (cid:), so nothing is fetched from Foundura when an email is opened.
 */

const INK = "#141b47";
const NAVY = "#003271";
const ORANGE = "#FE8202";
const MUTED = "#5b6280";
const PAPER = "#f7f8fc";
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', 'Noto Sans Devanagari', 'Nirmala UI', Arial, sans-serif";

export const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Escapes a line and turns http(s) addresses into links (trailing punctuation stays outside the link). */
export function linkify(line: string): string {
  const out: string[] = [];
  let last = 0;
  for (const m of line.matchAll(/https?:\/\/[^\s<>"]+/g)) {
    let url = m[0];
    const trail = url.match(/[.,;:!?)\]]+$/)?.[0] ?? "";
    if (trail) url = url.slice(0, -trail.length);
    out.push(escapeHtml(line.slice(last, m.index)));
    out.push(`<a href="${escapeHtml(url)}" style="color:${NAVY};text-decoration:underline;word-break:break-all">${escapeHtml(url)}</a>`);
    last = m.index + url.length;
  }
  out.push(escapeHtml(line.slice(last)));
  return out.join("");
}

function blocks(text: string, small: boolean): string {
  const size = small ? "13px" : "16px";
  const color = small ? MUTED : INK;
  return text
    .split(/\n\s*\n/)
    .map((b) => b.split("\n").filter((l) => l.trim() !== ""))
    .filter((lines) => lines.length > 0)
    .flatMap((lines) => {
      // Runs of "- " lines become lists; other runs stay paragraphs ("The short version:" then a list).
      const runs: { list: boolean; lines: string[] }[] = [];
      for (const l of lines) {
        const list = l.startsWith("- ");
        if (runs.at(-1)?.list === list) runs.at(-1)!.lines.push(l);
        else runs.push({ list, lines: [l] });
      }
      return runs.map((r, i) => {
        const gap = i < runs.length - 1 && !r.list ? "6px" : "16px";
        if (r.list) {
          const items = r.lines.map((l) => `<li style="margin:0 0 6px">${linkify(l.slice(2))}</li>`).join("");
          return `<ul style="margin:0 0 16px;padding:0 0 0 20px;font-size:${size};line-height:1.55;color:${color}">${items}</ul>`;
        }
        return `<p style="margin:0 0 ${gap};font-size:${size};line-height:1.6;color:${color}">${r.lines.map(linkify).join("<br>")}</p>`;
      });
    })
    .join("\n");
}

export interface HtmlEmail {
  subject: string;
  text: string;
  /** Shown large after the first paragraph, e.g. a sign-in code. */
  highlight?: string;
  lang: "en" | "hi";
  /** The site's address, for the link under the card. */
  site: string;
}

export function emailHtml({ subject, text, highlight, lang, site }: HtmlEmail): string {
  const [body, ...rest] = text.split(/\n--(?:\n|$)/);
  const small = rest.join("\n");
  let main = blocks(body, false);
  if (highlight) {
    const box = `<p style="margin:0 0 20px"><span style="display:inline-block;padding:12px 20px;border:2px solid ${NAVY};border-radius:8px;font-size:30px;font-weight:700;letter-spacing:6px;color:${NAVY};font-family:Menlo,Consolas,monospace">${escapeHtml(highlight)}</span></p>`;
    const end = main.indexOf("</p>");
    main = end === -1 ? box + main : main.slice(0, end + 4) + "\n" + box + main.slice(end + 4);
  }
  const host = site.replace(/^https?:\/\//, "");
  return `<!DOCTYPE html>
<html lang="${lang}" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};font-family:${FONT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER}">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td style="background:#ffffff;border-top:4px solid ${ORANGE};border-radius:6px;padding:24px 28px 12px;font-family:${FONT}">
<img src="cid:${LOGO_CID}" width="180" height="50" alt="Foundura" style="display:block;border:0;width:180px;height:50px;margin:0 0 20px">
${main}
</td></tr>
${small ? `<tr><td style="padding:16px 4px 0;font-family:${FONT}">\n${blocks(small, true)}\n</td></tr>` : ""}
<tr><td style="padding:8px 4px 0;font-size:13px;color:${MUTED};font-family:${FONT}"><a href="${escapeHtml(site)}" style="color:${MUTED}">${escapeHtml(host)}</a></td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
