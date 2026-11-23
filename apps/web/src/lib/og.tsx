import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Static font files for share images (the site's own fonts are woff2, which the image renderer can't read).
// Anek Latin condensed bold was cut from the variable font; both fonts are under the SIL Open Font License.
const dir = path.join(process.cwd(), "assets/og-fonts");
let fonts: Promise<[Buffer, Buffer]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([readFile(path.join(dir, "anek-latin-condensed-bold.ttf")), readFile(path.join(dir, "mukta-latin-600-normal.woff"))]));

// The Foundura logo (public/brand), embedded as a data URI so the renderer needs no network.
let logo: Promise<string> | null = null;
const logoUri = () =>
  (logo ??= readFile(path.join(process.cwd(), "public/brand/foundura-logo.svg")).then((b) => `data:image/svg+xml;base64,${b.toString("base64")}`));

/**
 * Share image in the site's style: paper background, condensed headline, and the rubber stamp
 * used on Scheme Scan results.
 */
export async function ogImage({ eyebrow, title, stamp, cover }: { eyebrow: string; title: string; stamp?: string; cover?: string }) {
  const [anek, mukta] = await loadFonts();
  // A template's drawn cover (public/art/covers), shown as a card on the right.
  const coverUri = cover
    ? `data:image/svg+xml;base64,${(await readFile(path.join(process.cwd(), "public/art/covers", `${cover}.svg`))).toString("base64")}`
    : null;
  const size = title.length > 70 ? 64 : title.length > 40 ? 80 : 96;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f8fc", fontFamily: "Mukta" }}>
        <div style={{ width: 24, height: "100%", background: "#f2a900" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 56px 64px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered by the image generator, not the page */}
          <img src={await logoUri()} width={238} height={66} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, color: "#5b6478" }}>{eyebrow}</div>
            <div style={{ fontFamily: "Anek", fontSize: size, lineHeight: 1.02, color: "#0f1538", marginTop: 12, maxWidth: coverUri ? 600 : stamp ? 760 : 1000 }}>{title}</div>
          </div>
          <div style={{ fontSize: 26, color: "#1f2a6b" }}>Free help for Indian founders. We never handle your money.</div>
        </div>
        {coverUri && (
          <div
            style={{
              position: "absolute",
              right: 64,
              top: 120,
              display: "flex",
              transform: "rotate(-3deg)",
              border: "6px solid #141b47",
              borderRadius: 18,
              boxShadow: "10px 10px 0 #141b47",
              overflow: "hidden",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- rendered by the image generator, not the page */}
            <img src={coverUri} width={440} height={330} alt="" />
          </div>
        )}
        {stamp && (
          <div
            style={{
              position: "absolute",
              right: coverUri ? 380 : 72,
              top: coverUri ? 440 : 250,
              background: coverUri ? "#f7f8fc" : "transparent",
              transform: "rotate(-8deg)",
              border: "6px solid #1e7a4e",
              borderRadius: 12,
              padding: "14px 26px",
              fontFamily: "Anek",
              fontSize: 40,
              color: "#1e7a4e",
              display: "flex",
            }}
          >
            {stamp}
          </div>
        )}
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Anek", data: anek, weight: 700, style: "normal" },
        { name: "Mukta", data: mukta, weight: 600, style: "normal" },
      ],
    },
  );
}
