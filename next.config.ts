import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent bundling of packages that rely on native Node.js TLS/TCP modules.
  // Without this, the Stripe SDK can't open connections in serverless functions,
  // and ioredis loses its native net/tls stack, causing StripeConnectionError and
  // Redis AggregateErrors at runtime.
  serverExternalPackages: ["stripe", "ioredis"],
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
