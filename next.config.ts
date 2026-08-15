import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // @ts-ignore
  experimental: {
    // force turbopack off in dev is not straightforward; instead we rely on turbopack root fix
  },
};

export default nextConfig;
