import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactStrictMode: true,
  poweredByHeader: false,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    agentUpgrade: "security",
  },
  /** DS-94 gallery URL from the issue checklist (`/_design` → App Router `/design`). */
  async redirects() {
    return [{ source: "/_design", destination: "/design", permanent: false }];
  },
};

export default nextConfig;
