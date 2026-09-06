import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-url";

export default function sitemap():
  MetadataRoute.Sitemap {
  const baseUrl = siteUrl();

  const routes = [
    "",
    "/about",
    "/products",
    "/solutions",
    "/technology",
    "/cases",
    "/news",
    "/contact",
    "/inquiry",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency:
      route === "" ? "weekly" : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/products"
          ? 0.9
          : 0.7,
  }));
}