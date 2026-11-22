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

/**
 * Share image in the site's style: paper background, condensed headline, and the rubber stamp
 * used on Scheme Scan results.
 */
export async function ogImage({ eyebrow, title, stamp }: { eyebrow: string; title: string; stamp?: string }) {
  const [anek, mukta] = await loadFonts();
  const size = title.length > 70 ? 64 : title.length > 40 ? 80 : 96;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f8fc", fontFamily: "Mukta" }}>
        <div style={{ width: 24, height: "100%", background: "#f2a900" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px 56px 64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 22, border: "5px solid #141b47", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: 6, background: "#f2a900" }} />
            </div>
            <div style={{ fontFamily: "Anek", fontSize: 44, color: "#141b47" }}>Foundura</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, color: "#5b6478" }}>{eyebrow}</div>
            <div style={{ fontFamily: "Anek", fontSize: size, lineHeight: 1.02, color: "#0f1538", marginTop: 12, maxWidth: stamp ? 760 : 1000 }}>{title}</div>
          </div>
          <div style={{ fontSize: 26, color: "#1f2a6b" }}>Free help for Indian founders. We never handle your money.</div>
        </div>
        {stamp && (
          <div
            style={{
              position: "absolute",
              right: 72,
              top: 250,
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
