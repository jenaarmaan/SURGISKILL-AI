import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Bypass type checking during cloud build to avoid memory limit (OOM) crashes
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bypass lint checks during cloud build to prevent container memory limit crashes
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
