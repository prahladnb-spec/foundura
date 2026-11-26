import path from "node:path";
import type { NextConfig } from "next";
import { LANGS } from "./src/i18n/config";

const common = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
];

/**
 * Content Security Policy. Everything Foundura loads comes from its own origin: no outside
 * scripts, fonts, images or trackers. 'unsafe-inline' is needed for the small inline scripts
 * Next.js adds to statically built pages (nonces would force every page to render per request).
 * The development server also needs eval for fast refresh.
 */
const csp = (frameAncestors: string) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${frameAncestors}`,
  ].join("; ");

// Languages with a URL prefix (English lives at plain URLs).
const PREFIXED = LANGS.filter((l) => l !== "en").join("|");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker image (apps/web/Dockerfile).
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: { "/**/*": ["./assets/og-fonts/*", "./public/art/covers/*"] },
  poweredByHeader: false,
  // Put the title, description, canonical and social tags in the <head> for every visitor. Next streams them into the body
  // by default (even for prerendered pages), where link previews and some crawlers miss them. Ours are computed locally.
  htmlLimitedBots: /.*/,
  transpilePackages: ["@foundura/shared"],
  async headers() {
    return [
      // Everything except the embed widget refuses to be framed (clickjacking protection).
      {
        source: `/((?!embed/|(?:${PREFIXED})/embed/).*)`,
        headers: [
          ...common,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: csp("'none'") },
        ],
      },
      // The widget, in every language, may be framed by partner sites. It sets no cookies and stores nothing.
      {
        source: "/embed/:path*",
        headers: [...common, { key: "Content-Security-Policy", value: csp("*") }],
      },
      {
        source: `/:lang(${PREFIXED})/embed/:path*`,
        headers: [...common, { key: "Content-Security-Policy", value: csp("*") }],
      },
      // Private profile links carry their key in the path: never send it on as a referrer, never index it.
      { source: "/shared/:token", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: `/:lang(${PREFIXED})/shared/:token`, headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/embed.js", headers: [{ key: "Cache-Control", value: "public, max-age=3600" }] },
    ];
  },
};

export default nextConfig;
