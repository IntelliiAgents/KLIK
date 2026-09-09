import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KliK 2026 - Kleinmond Inniebos Kunstefees",
    short_name: "KliK 2026",
    description: "Official guide, programme, venue map & quest for the KliK 2026 Kunstefees in Kleinmond, Western Cape.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF6EE",
    theme_color: "#133D4B",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    categories: ["entertainment", "festivals", "arts", "travel"],
    lang: "en-ZA",
  };
}
