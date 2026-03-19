import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getBlogPosts } from "@/lib/wordpress";

const routes = [
  "",
  "/the-cooperative",
  "/eligibility",
  "/benefits",
  "/resources",
  "/join",
  "/about",
  "/ai-reference",
  "/contact",
  "/bylaws",
  "/coalition-member",
  "/terms-of-service",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : ("monthly" as const),
    priority: path === "" ? 1 : 0.8,
  }));

  const posts = await getBlogPosts();
  const blogEntries: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.dateIso ? new Date(p.dateIso) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  return [...staticEntries, ...blogEntries];
}
