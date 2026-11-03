import type { MetadataRoute } from "next";
import { APP_DESCRIPTION, APP_NAME, THEME } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — UNILORIN Campus Fashion Store`,
    short_name: APP_NAME,
    description: APP_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: THEME.colors.background,
    theme_color: THEME.colors.foreground,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
