import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "/member-portal", // Prefix all routes with /member-portal
  reactCompiler: true,
  output: "standalone", // Enable standalone output for Docker
};

export default nextConfig;
