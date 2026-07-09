import type { MetadataRoute } from "next";

// Web app manifest — makes the site installable ("Add to Home Screen") as a
// standalone app. Next serves this at /manifest.webmanifest and auto-links it.
// No service worker / offline support yet (intentionally out of scope for now).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Book Tracker",
    short_name: "Books",
    description: "A faster, friendlier reading log.",
    start_url: "/library",
    display: "standalone",
    background_color: "#f5efe3", // paper
    theme_color: "#b5502f", // terracotta accent
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
