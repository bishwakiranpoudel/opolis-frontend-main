/**
 * Podcast episodes from WordPress (categories Unemployable + Opolis Public Radio).
 * Used when CONTENT_SOURCE=wordpress and Firestore has not been populated yet.
 */

import {
  comparePodcastEpisodes,
  enrichPodcastEpisodeSeasonFields,
  extractYoutubeVideoId,
  PODCAST_WP_CATEGORY_IDS,
  resolveSeriesBaseForSlug,
  type FullPodcastEpisode,
  type PodcastEpisode,
} from "@/lib/podcastTypes";
import {
  decodeHtmlEntitiesLite,
  rewriteLegacyOpolisLinks,
} from "@/lib/podcastContent";
import {
  SITE_URL,
  unemployableSeasonTwoStartIso,
  unemployableSeasonWpCategoryIds,
} from "@/lib/constants";
import { playlistYoutubeIdForPodcastSlug } from "@/lib/podcastYoutubeSlugMap";

const WORDPRESS_URL = process.env.WORDPRESS_URL || "";
const REVALIDATE_SECONDS = 60;

interface WPPostEmbedded {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified?: string;
  link: string;
  categories: number[];
  featured_media: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate.slice(0, 10);
  }
}

function mapPost(
  post: WPPostEmbedded,
  wpCategories: Map<number, { slug: string; name: string }>
): PodcastEpisode {
  const cats = post.categories ?? [];
  const seriesBase = resolveSeriesBaseForSlug(post.slug, cats);
  const seasonCats = unemployableSeasonWpCategoryIds();
  const seasonFields = enrichPodcastEpisodeSeasonFields(
    post.slug,
    seriesBase,
    post.date,
    cats,
    wpCategories,
    {
      season2StartIso: unemployableSeasonTwoStartIso(),
      s1: seasonCats.s1,
      s2: seasonCats.s2,
    }
  );
  const { seasonOrder, seriesKey, seriesTitle } = seriesBase;
  const { seasonLabel, episodeSeasonLabel, episodeSeasonSort } = seasonFields;
  const thumb =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || undefined;
  const html = post.content?.rendered ?? "";
  const excerptRaw = post.excerpt?.rendered ?? "";
  const ytMerged = [html, excerptRaw, thumb ?? ""].join("\n");
  return {
    slug: post.slug,
    title: decodeHtmlEntitiesLite(stripHtml(post.title?.rendered || "")),
    excerptHtml: rewriteLegacyOpolisLinks(excerptRaw, SITE_URL),
    date: formatDate(post.date),
    dateIso: post.date,
    seasonLabel,
    seasonOrder,
    episodeSeasonLabel,
    episodeSeasonSort,
    seriesKey,
    seriesTitle,
    thumbnailUrl: thumb,
    youtubeVideoId:
      playlistYoutubeIdForPodcastSlug(post.slug) ??
      extractYoutubeVideoId(ytMerged),
    legacyPermalink: post.link,
  };
}

async function fetchWpCategoryMap(): Promise<
  Map<number, { slug: string; name: string }>
> {
  const base = WORDPRESS_URL.replace(/\/$/, "");
  if (!base) return new Map();
  const url = `${base}/wp-json/wp/v2/categories?per_page=100&_fields=id,name,slug`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      "Content-Type": "application/json",
      ...(process.env.WORDPRESS_API_TOKEN && {
        Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
      }),
    },
  });
  if (!res.ok) return new Map();
  const data = (await res.json()) as Array<{
    id: number;
    slug: string;
    name: string;
  }>;
  const map = new Map<number, { slug: string; name: string }>();
  if (Array.isArray(data)) {
    for (const c of data) {
      map.set(c.id, { slug: c.slug, name: c.name });
    }
  }
  return map;
}

async function fetchPostsForCategory(
  baseUrl: string,
  categoryId: number
): Promise<WPPostEmbedded[]> {
  const fields =
    "id,slug,title,content,excerpt,date,modified,link,categories,featured_media";
  const firstUrl = `${baseUrl}/wp-json/wp/v2/posts?categories=${categoryId}&per_page=100&status=publish&_embed&_fields=${fields}`;
  const res = await fetch(firstUrl, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      "Content-Type": "application/json",
      ...(process.env.WORDPRESS_API_TOKEN && {
        Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
      }),
    },
  });
  if (!res.ok) return [];
  const first = (await res.json()) as WPPostEmbedded[];
  const posts = Array.isArray(first) ? [...first] : [];
  const total = res.headers.get("X-WP-Total");
  const totalNum = total ? parseInt(total, 10) : posts.length;
  const totalPages = Math.max(1, Math.ceil(totalNum / 100));

  for (let page = 2; page <= totalPages; page++) {
    const url = `${baseUrl}/wp-json/wp/v2/posts?categories=${categoryId}&per_page=100&page=${page}&status=publish&_embed&_fields=${fields}`;
    const r = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WORDPRESS_API_TOKEN && {
          Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
        }),
      },
    });
    if (!r.ok) break;
    const data = (await r.json()) as WPPostEmbedded[];
    if (Array.isArray(data)) posts.push(...data);
  }
  return posts;
}

export async function getPodcastEpisodesFromWordPress(): Promise<PodcastEpisode[]> {
  if (!WORDPRESS_URL) return [];
  const baseUrl = WORDPRESS_URL.replace(/\/$/, "");
  const byId = new Map<number, WPPostEmbedded>();

  for (const catId of PODCAST_WP_CATEGORY_IDS) {
    const batch = await fetchPostsForCategory(baseUrl, catId);
    for (const p of batch) {
      byId.set(p.id, p);
    }
  }

  const wpCategories = await fetchWpCategoryMap();
  const episodes = Array.from(byId.values()).map((p) =>
    mapPost(p, wpCategories)
  );
  episodes.sort(comparePodcastEpisodes);
  return episodes;
}

export async function getPodcastEpisodeBySlugFromWordPress(
  slug: string
): Promise<FullPodcastEpisode | null> {
  if (!WORDPRESS_URL || !slug) return null;
  const baseUrl = WORDPRESS_URL.replace(/\/$/, "");
  const fields =
    "id,slug,title,content,excerpt,date,modified,link,categories,featured_media";
  const url = `${baseUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(
    slug
  )}&status=publish&_embed&_fields=${fields}`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      "Content-Type": "application/json",
      ...(process.env.WORDPRESS_API_TOKEN && {
        Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
      }),
    },
  });
  if (!res.ok) return null;
  const arr = (await res.json()) as WPPostEmbedded[];
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const post = arr[0];
  const cats = post.categories ?? [];
  const podcastCats = new Set<number>(PODCAST_WP_CATEGORY_IDS);
  const isPodcast = cats.some((c) => podcastCats.has(c));
  if (!isPodcast) return null;

  const wpCategories = await fetchWpCategoryMap();
  const base = mapPost(post, wpCategories);
  return {
    ...base,
    contentHtml: rewriteLegacyOpolisLinks(
      post.content?.rendered ?? "",
      SITE_URL
    ),
    modified: post.modified ? formatDate(post.modified) : undefined,
    modifiedIso: post.modified,
  };
}
