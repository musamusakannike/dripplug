import type { MetadataRoute } from "next";
import { APP_URL } from "@/config/site";
import { getCategories, getFilteredCatalog } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, catalog] = await Promise.all([
    getCategories(),
    getFilteredCatalog({ limit: 500 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/faq",
    "/delivery-returns",
    "/terms",
    "/privacy",
  ].map((route) => ({
    url: `${APP_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/shop" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${APP_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const productRoutes: MetadataRoute.Sitemap = catalog.products.map((prod) => ({
    url: `${APP_URL}/product/${prod.slug}`,
    lastModified: new Date(prod.createdAt),
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
