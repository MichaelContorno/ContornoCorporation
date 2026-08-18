import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  serverExternalPackages: ["@aws-sdk/client-s3", "pg"],
};

export default nextConfig;
