import type { MetadataRoute } from "next";
import { publicSitePaths, SITE_ORIGIN } from "@/app/_lib/site-links";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-08-18T00:00:00-04:00");

  return publicSitePaths.map((path) => ({
    url: new URL(path, SITE_ORIGIN).href,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/services/") ? 0.8 : 0.7,
  }));
}
