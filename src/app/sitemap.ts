import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { STATIC_SITEMAP_PATHS } from "@/lib/site-paths";
import { blogPostPath } from "@/lib/blogPosts";
import { listGuideViewerPaths } from "@/lib/guideItems";
import { getPodcastEpisodes, podcastEpisodePath } from "@/lib/podcasts";
import { getBlogPosts } from "@/lib/wordpress";
import { getGuides } from "@/lib/wordpressResources";

/**
 * Build-time sitemaps often run without Firestore / WordPress credentials, so
 * `getBlogPosts()` returns [] and every `/blog/{slug}` URL would be missing.
 * Generating on request picks up the same env as the live app.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_SITEMAP_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : ("monthly" as const),
    priority: path === "" ? 1 : 0.8,
  }));

  const [posts, podcastEpisodes, guides] = await Promise.all([
    getBlogPosts(),
    getPodcastEpisodes(),
    getGuides(),
  ]);
  const blogEntries: MetadataRoute.Sitemap = posts
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}${blogPostPath(p)}`,
      lastModified: p.dateIso ? new Date(p.dateIso) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const podcastEntries: MetadataRoute.Sitemap = podcastEpisodes.map((ep) => ({
    url: `${SITE_URL}${podcastEpisodePath(ep.slug)}`,
    lastModified: ep.dateIso ? new Date(ep.dateIso) : new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const guideViewerPaths = listGuideViewerPaths(guides);
  const guideEntries: MetadataRoute.Sitemap = guideViewerPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.62,
  }));

  return [...staticEntries, ...blogEntries, ...podcastEntries, ...guideEntries];
}
