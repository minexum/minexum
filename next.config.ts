import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Don’t fail the production build on ESLint errors
    ignoreDuringBuilds: true,
  },
  // (optional) if you want to ship even with TS errors, enable this too:
  // typescript: { ignoreBuildErrors: true },

  images: {
    // optional: allow remote images if you later use <Image />
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
