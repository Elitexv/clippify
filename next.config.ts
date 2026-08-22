import type { NextConfig } from "next";

const isMobileExport = process.env.BUILD_TARGET === "mobile";

const nextConfig: NextConfig = {
  ...(isMobileExport ? { output: "export" as const, trailingSlash: true } : {}),
  images: {
    unoptimized: isMobileExport,
    remotePatterns: [
      new URL("https://picsum.photos/**"),
      new URL("https://fastly.picsum.photos/**"),
    ],
  },
};

export default nextConfig;
