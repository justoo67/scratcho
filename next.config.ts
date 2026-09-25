import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "*.devtunnels.ms",
    "*.uks1.devtunnels.ms",
    "h79j7x5m-3000.uks1.devtunnels.ms",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        "*.devtunnels.ms",
        "*.uks1.devtunnels.ms",
        "h79j7x5m-3000.uks1.devtunnels.ms",
      ],
    },
  },
}

export default nextConfig
