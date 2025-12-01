import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/member-portal", // Prefix all routes with /member-portal
  reactCompiler: true,
  output: "standalone", // Enable standalone output for Docker
};

export default nextConfig;
