import type { NextConfig } from "next";

// Product photos are served from the Supabase Storage bucket "product-media".
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/product-media/**`)] : [],
  },
  experimental: {
    // Quote / repair forms can attach one file of up to 20 MB (checked again in the action).
    serverActions: { bodySizeLimit: "21mb" },
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
