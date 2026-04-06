import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { STATIC_SITEMAP_PATHS } from "@/lib/site-paths";
import { getBlogPosts } from "@/lib/wordpress";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map((path) => ({
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
