import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Augmenter la limite pour les Server Actions (upload de fichiers volumineux)
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        port: "",
        pathname: "/**",
      },
      {
        // Supabase Storage - votre projet specifique
        protocol: "https",
        hostname: "elnyoarfjghwmxqyjdbz.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        // Supabase Storage - fallback avec wildcard
        protocol: "https",
        hostname: "**.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
