import type { NextConfig } from "next";
import path from "path";

const r2CustomUrl =
  process.env.NEXT_PUBLIC_CLOUDFLARE_R2_URL ||
  process.env.CLOUDFLARE_R2_PUBLIC_URL;

let customHost: string | null = null;
if (r2CustomUrl) {
  try {
    customHost = new URL(r2CustomUrl).hostname;
  } catch {
    // Ignore invalid URL
  }
}

const remotePatterns = [
  {
    protocol: "https" as const,
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https" as const,
    hostname: "*.r2.cloudflarestorage.com",
  },
  {
    protocol: "https" as const,
    hostname: "*.r2.dev",
  },
];

if (customHost && !remotePatterns.some((p) => p.hostname === customHost)) {
  remotePatterns.push({
    protocol: "https" as const,
    hostname: customHost,
  });
}

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingRoot: path.resolve(__dirname),
  outputFileTracingIncludes: {
    '/**': ['./data/**/*', './migrations/**/*'],
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
