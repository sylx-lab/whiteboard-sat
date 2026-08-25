import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A Desmos API key is public by design — it ships in the page that embeds the
  // calculator. Inlining it here keeps one name (`DESMOS_KEY`) in .env instead of
  // a second NEXT_PUBLIC_ copy. It is read at *build* time, so the deploy
  // platform must have it set for the build, not only at runtime.
  env: {
    DESMOS_KEY: process.env.DESMOS_KEY ?? '',
  },
};

export default nextConfig;
