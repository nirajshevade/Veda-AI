import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker, while allowing Vercel native serverless builds
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
