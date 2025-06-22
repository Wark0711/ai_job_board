import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    dynamicIO: true,
    useCache: true
  }
};

export default nextConfig;
