import { json } from "#remix-server";

export function loader() {
  return json(
    {
      name: "Remix Examples",
      short_name: "Remix Examples",
      start_url: "./notes",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "minimal-ui",
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
      },
    }
  );
}
