import path from "node:path";
import type { NextConfig } from "next";

const common = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker image (apps/web/Dockerfile).
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  outputFileTracingIncludes: { "/**/*": ["./assets/og-fonts/*"] },
  poweredByHeader: false,
  transpilePackages: ["@foundura/shared"],
  async headers() {
    return [
      // Everything except the embed widget refuses to be framed (clickjacking protection).
      {
        source: "/((?!embed/).*)",
        headers: [...common, { key: "X-Frame-Options", value: "DENY" }, { key: "Content-Security-Policy", value: "frame-ancestors 'none'" }],
      },
      // The widget may be framed by partner sites. It sets no cookies and stores nothing.
      {
        source: "/embed/:path*",
        headers: [...common, { key: "Content-Security-Policy", value: "frame-ancestors *" }],
      },
      { source: "/embed.js", headers: [{ key: "Cache-Control", value: "public, max-age=3600" }] },
    ];
  },
};

export default nextConfig;
