import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatlegal.in";
  const currentDate = new Date();

  const routes = [
    "",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
    "/rights",
    "/help",
    "/chat",
    "/simplify",
    "/auth",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/about" || route === "/rights" || route === "/chat" ? 0.8 : 0.6,
  }));
}
