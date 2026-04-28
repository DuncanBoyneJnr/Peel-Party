import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ioredis uses native Node.js net/tls — must not be bundled
  serverExternalPackages: ["ioredis"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
