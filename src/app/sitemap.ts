import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://specvla-ergon-avditor-mvndi.vercel.app";
  const now = new Date();

  const routes = [
    "",
    "/about",
    "/compare",
    "/docs",
    "/examples",
    "/pricing",
    "/history",
    "/vault",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/pricing" || route === "/about" || route === "/compare" ? 0.8 : 0.6,
  }));
}
