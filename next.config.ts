import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/videos", destination: "/social", permanent: true }];
  },
};

export default nextConfig;
