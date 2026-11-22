import path from "node:path";
import type { NextConfig } from "next";

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

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker image (apps/web/Dockerfile).
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: { "/**/*": ["./assets/og-fonts/*", "./public/art/covers/*"] },
  poweredByHeader: false,
  transpilePackages: ["@foundura/shared"],
  async headers() {
    return [
      // Everything except the embed widget (English or Hindi) refuses to be framed (clickjacking protection).
      {
        source: "/((?!embed/|hi/embed/).*)",
        headers: [
          ...common,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Content-Security-Policy", value: csp("'none'") },
        ],
      },
      // The widget may be framed by partner sites. It sets no cookies and stores nothing.
      {
        source: "/embed/:path*",
        headers: [...common, { key: "Content-Security-Policy", value: csp("*") }],
      },
      {
        source: "/hi/embed/:path*",
        headers: [...common, { key: "Content-Security-Policy", value: csp("*") }],
      },
      { source: "/embed.js", headers: [{ key: "Cache-Control", value: "public, max-age=3600" }] },
    ];
  },
};

export default nextConfig;
