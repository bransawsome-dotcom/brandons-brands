import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smooth cross-fades between pages (React <ViewTransition> in the root layout).
  experimental: { viewTransition: true },
  async redirects() {
    return [
      { source: "/videos", destination: "/social", permanent: true },
      { source: "/register", destination: "/signup", permanent: false },
    ];
  },
};

export default nextConfig;
