import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/app/_lib/site-links";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
