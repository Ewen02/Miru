import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Miru",
    short_name: "Miru",
    description: "Explorer, organiser, partager les animes.",
    start_url: "/",
    display: "standalone",
    background_color: "#08080c",
    theme_color: "#08080c",
    lang: "fr",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
