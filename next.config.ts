import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://*.tile.openstreetmap.org",
      "connect-src 'self'",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Standard Vercel deployment (supports SSR/ISR); no static export required
  // Vercel handles Next.js natively with edge/serverless functions

  async headers() {
    return [
      {
        // Security headers on all routes
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/data/:path*",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }],
      },
    ];
  },
};

export default nextConfig;
