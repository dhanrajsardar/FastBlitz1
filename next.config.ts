import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedRevalidateHeaderKeys: ["x-vercel-protection-bypass"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
