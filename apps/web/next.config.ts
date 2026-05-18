import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "img.anili.st" },
      { protocol: "https", hostname: "**.crunchyroll.com" },
      { protocol: "https", hostname: "**.netflix.com" },
      { protocol: "https", hostname: "**.hidive.com" },
      { protocol: "https", hostname: "**.funimation.com" },
    ],
  },
};

export default nextConfig;
