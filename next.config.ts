import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standard Vercel deployment (supports SSR/ISR); no static export required
  // Vercel handles Next.js natively with edge/serverless functions

  // Suppress CORS warning for public data files in dev
  async headers() {
    return [
      {
        source: "/data/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },
};

export default nextConfig;
