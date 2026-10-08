import type { MetadataRoute } from "next";

// Lets people add Brandon's Brands to their phone's home screen with the logo as the app icon.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brandon's Brands",
    short_name: "Brandon's Brands",
    description: "Luxury watch collection, wishlist and community.",
    start_url: "/",
    display: "standalone",
    background_color: "#07111F",
    theme_color: "#07111F",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
