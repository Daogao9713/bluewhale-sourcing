import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.3.153",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "lfmpnjkefyuczrjiwryq.supabase.co",
        pathname:
          "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;