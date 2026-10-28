import type { NextConfig } from "next";

// Product photos are served from the Supabase Storage bucket "product-media".
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/product-media/**`)] : [],
  },
  experimental: {
    // Applies to every Server Action, public forms included, so keep it tight:
    // one 20 MB quote / repair attachment. Staff photos are shrunk in the browser first.
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
