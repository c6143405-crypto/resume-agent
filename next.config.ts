import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost", port: "3845" }],
  },
};

export default nextConfig;
