/**
 * Read blog + resources content from Firestore (migrated from WordPress).
 * Default content path (when CONTENT_SOURCE is not wordpress). Requires Firebase Admin on the server.
 */

import { getFirestore } from "firebase-admin/firestore";
import type { BlogPost, FullBlogPost } from "@/lib/blogPosts";
import { BLOG_CATEGORY_FALLBACK_SLUG } from "@/lib/blogPosts";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { COLLECTIONS, RESOURCES_FAQ_DOC_ID, RESOURCES_GUIDES_DOC_ID } from "@/lib/firebase/schema";
import type { BlogCategoryDoc, BlogPostDoc, PodcastEpisodeDoc } from "@/lib/firebase/types";
import {
  comparePodcastEpisodes,
  inferSeriesFromLegacyEpisode,
  inferSeriesFromSlugAllowlist,
  unemployableEpisodeSeasonLegacyDateOnly,
  PODCAST_SERIES_META,
  type FullPodcastEpisode,
  type PodcastEpisode,
} from "@/lib/podcastTypes";
import {
  decodeHtmlEntitiesLite,
  rewriteLegacyOpolisLinks,
  rewriteStoredDevOrigin,
} from "@/lib/podcastContent";
import { SITE_URL, unemployableSeasonTwoStartIso } from "@/lib/constants";
import { playlistYoutubeIdForPodcastSlug } from "@/lib/podcastYoutubeSlugMap";
import type { FaqSection, GuidesSection } from "@/lib/resourcesData";
import { FAQ_SECTIONS, GUIDES_DATA } from "@/lib/resourcesData";

/**
 * Some Firestore writes expose arrays as maps with numeric keys; Admin returns a plain object, not [].
 */
function coerceFirestoreArray(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o).filter((k) => /^\d+$/.test(k));
    if (keys.length === 0) return [];
    return keys
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => o[k]);
  }
  return [];
}

function normalizeGuideItems(items: unknown): GuidesSection["items"] {
  const out: GuidesSection["items"] = [];
  for (const it of coerceFirestoreArray(items)) {
    if (!it || typeof it !== "object") continue;
    const i = it as Record<string, unknown>;
    if (
      typeof i.type === "string" &&
      typeof i.label === "string" &&
      typeof i.url === "string"
    ) {
      out.push({ type: i.type, label: i.label, url: i.url });
    }
  }
  return out;
}

function normalizeGuidesSection(raw: unknown): GuidesSection | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.cat !== "string" || typeof o.cc !== "string") return null;
  const items = normalizeGuideItems(o.items);
  if (items.length === 0) return null;
  return { cat: o.cat, cc: o.cc, items };
}

/** Parse `resources_guides/data` whether `guides` is a real array or a numeric-key map. */
function parseGuidesFromDocData(
  data: Record<string, unknown> | undefined
): GuidesSection[] | null {
  if (!data) return null;
  const fromGuides = coerceFirestoreArray(data.guides);
  if (fromGuides.length > 0) {
    const sections = fromGuides
      .map(normalizeGuidesSection)
      .filter((s): s is GuidesSection => s != null);
    if (sections.length > 0) return sections;
  }
  if (
    typeof data.cat === "string" &&
    typeof data.cc === "string" &&
    data.items != null &&
    data.guides == null
  ) {
    const items = normalizeGuideItems(data.items);
    if (items.length === 0) return null;
    return [{ cat: data.cat, cc: data.cc, items }];
  }
  return null;
}

function normalizeFaqItems(items: unknown): FaqSection["items"] {
  const out: FaqSection["items"] = [];
  for (const it of coerceFirestoreArray(items)) {
    if (!it || typeof it !== "object") continue;
    const i = it as Record<string, unknown>;
    if (typeof i.q === "string" && typeof i.a === "string") {
      out.push({ q: i.q, a: i.a });
    }
  }
  return out;
}

function normalizeFaqSection(raw: unknown): FaqSection | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string") return null;
  const items = normalizeFaqItems(o.items);
  if (items.length === 0) return null;
  return { id: o.id, label: o.label, items };
}

function parseFaqFromDocData(
  data: Record<string, unknown> | undefined
): FaqSection[] | null {
  if (!data) return null;
  const raw = coerceFirestoreArray(data.faq);
  if (raw.length === 0) return null;
  const sections = raw
    .map(normalizeFaqSection)
    .filter((s): s is FaqSection => s != null);
  return sections.length > 0 ? sections : null;
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

export type BlogCategoryMap = Map<number, { name: string; slug: string }>;

/** Permalinks or single URLs saved with a dev origin or legacy opolis.co. */
function normalizeStoredSiteAbsoluteUrl(s: string | undefined): string {
  if (s == null || !String(s).trim()) return s ?? "";
  const t = String(s).trim();
  return rewriteStoredDevOrigin(rewriteLegacyOpolisLinks(t, SITE_URL), SITE_URL);
}

function normalizeOptionalStoredUrl(s: string | undefined): string | undefined {
  if (s == null || !String(s).trim()) return undefined;
  const out = rewriteStoredDevOrigin(rewriteLegacyOpolisLinks(s.trim(), SITE_URL), SITE_URL);
  return out || undefined;
}

function resolveCategorySlug(
  d: BlogPostDoc,
  categoriesMap: BlogCategoryMap
): string {
  const firstId = d.categoryIds?.[0];
  if (firstId != null) {
    const cat = categoriesMap.get(firstId);
    if (cat?.slug) return cat.slug;
  }
  return BLOG_CATEGORY_FALLBACK_SLUG;
}

function docToBlogPost(
  d: BlogPostDoc,
  categoriesMap: BlogCategoryMap
): BlogPost {
  return {
    cat: d.cat,
    cc: d.cc,
    date: formatDate(d.dateIso),
    h: d.title,
    url: normalizeStoredSiteAbsoluteUrl(d.legacyPermalink || ""),
    slug: d.slug,
    categorySlug: resolveCategorySlug(d, categoriesMap),
    dateIso: d.dateIso,
  };
}

function docToFullBlogPost(
  d: BlogPostDoc,
  categoriesMap: BlogCategoryMap
): FullBlogPost {
  const base = docToBlogPost(d, categoriesMap);
  return {
    ...base,
    content: d.contentHtml,
    excerpt: d.excerptHtml,
    modified: d.modifiedIso ? formatDate(d.modifiedIso) : undefined,
    dateIso: d.dateIso,
    modifiedIso: d.modifiedIso,
    featuredImageUrl: d.featuredImageUrl,
  };
}

/**
 * Loads every `blog_categories/{wpId}` document into an in-memory map.
 * Callers should load once per request and pass to doc mappers.
 */
export async function getBlogCategoriesMapFromFirestore(): Promise<BlogCategoryMap> {
  getFirebaseAdmin();
  const db = getFirestore();
  const snap = await db.collection(COLLECTIONS.blogCategories).get();
  const map: BlogCategoryMap = new Map();
  snap.forEach((doc) => {
    const d = doc.data() as BlogCategoryDoc;
    if (d.wpId != null) {
      map.set(d.wpId, { name: d.name ?? "", slug: d.slug ?? "" });
    }
  });
  return map;
}

/** Apply optional manual URL rewrites from blog HTML (SEO migration). */
export function applyUrlRewriteMap(html: string): string {
  const raw = process.env.CONTENT_URL_REWRITE_MAP_JSON;
  if (!raw?.trim()) return html;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    let out = html;
    for (const [from, to] of Object.entries(map)) {
      if (from && to) out = out.split(from).join(to);
    }
    return out;
  } catch {
    return html;
  }
}

function normalizeBlogBodyHtml(html: string): string {
  let out = applyUrlRewriteMap(html);
  out = rewriteStoredDevOrigin(out, SITE_URL);
  out = rewriteLegacyOpolisLinks(out, SITE_URL);
  return out;
}

export async function getBlogPostsFromFirestore(): Promise<BlogPost[]> {
  getFirebaseAdmin();
  const db = getFirestore();
  const [snap, categoriesMap] = await Promise.all([
    db.collection(COLLECTIONS.blogPosts).orderBy("dateIso", "desc").get(),
    getBlogCategoriesMapFromFirestore(),
  ]);
  const out: BlogPost[] = [];
  snap.forEach((doc) => {
    const d = doc.data() as BlogPostDoc;
    out.push(docToBlogPost(d, categoriesMap));
  });
  return out;
}

export async function getBlogPostBySlugFromFirestore(
  slug: string
): Promise<FullBlogPost | null> {
  if (!slug) return null;
  getFirebaseAdmin();
  const db = getFirestore();
  const [ref, categoriesMap] = await Promise.all([
    db.collection(COLLECTIONS.blogPosts).doc(slug).get(),
    getBlogCategoriesMapFromFirestore(),
  ]);
  if (!ref.exists) return null;
  const d = ref.data() as BlogPostDoc;
  const full = docToFullBlogPost(d, categoriesMap);
  return {
    ...full,
    url: normalizeStoredSiteAbsoluteUrl(full.url || d.legacyPermalink),
    content: normalizeBlogBodyHtml(full.content),
    excerpt: normalizeBlogBodyHtml(full.excerpt),
    featuredImageUrl: normalizeOptionalStoredUrl(full.featuredImageUrl),
  };
}

export async function getGuidesFromFirestore(): Promise<GuidesSection[]> {
  getFirebaseAdmin();
  const db = getFirestore();
  const ref = await db
    .collection(COLLECTIONS.resourcesGuides)
    .doc(RESOURCES_GUIDES_DOC_ID)
    .get();
  if (!ref.exists) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_guides/data missing; using static GUIDES_DATA"
      );
    }
    return GUIDES_DATA;
  }
  const parsed = parseGuidesFromDocData(
    ref.data() as Record<string, unknown> | undefined
  );
  if (!parsed?.length) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_guides/data could not parse guides; using static GUIDES_DATA. Keys:",
        Object.keys(ref.data() ?? {})
      );
    }
    return GUIDES_DATA;
  }
  return parsed;
}

function formatPodcastDate(isoDate: string): string {
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

function resolveEpisodeSeasonFields(d: PodcastEpisodeDoc): {
  seasonLabel: string;
  episodeSeasonLabel: string;
  episodeSeasonSort: number;
} {
  const slugCanon = inferSeriesFromSlugAllowlist(d.slug);
  if (slugCanon?.seriesKey === "opolis-public-radio") {
    return {
      seasonLabel: `${slugCanon.seriesTitle} · Season 1`,
      episodeSeasonLabel: "Season 1",
      episodeSeasonSort: 1,
    };
  }
  if (slugCanon?.seriesKey === "unemployable") {
    return {
      seasonLabel: `${slugCanon.seriesTitle} · Season 2`,
      episodeSeasonLabel: "Season 2",
      episodeSeasonSort: 2,
    };
  }
  const series = inferSeriesFromLegacyEpisode(d);
  if (
    d.episodeSeasonLabel != null &&
    d.episodeSeasonSort != null
  ) {
    return {
      episodeSeasonLabel: d.episodeSeasonLabel,
      episodeSeasonSort: d.episodeSeasonSort,
      seasonLabel:
        d.seasonLabel ||
        (series.seriesKey === "unemployable"
          ? `${series.seriesTitle} · ${d.episodeSeasonLabel}`
          : series.seriesKey === "opolis-public-radio"
            ? `${series.seriesTitle} · Season 1`
            : d.seasonLabel),
    };
  }
  if (series.seriesKey === "unemployable") {
    const u = unemployableEpisodeSeasonLegacyDateOnly(
      d.dateIso,
      unemployableSeasonTwoStartIso()
    );
    return {
      episodeSeasonLabel: u.episodeSeasonLabel,
      episodeSeasonSort: u.episodeSeasonSort,
      seasonLabel: `${PODCAST_SERIES_META.unemployable.title} · ${u.episodeSeasonLabel}`,
    };
  }
  if (series.seriesKey === "opolis-public-radio") {
    return {
      seasonLabel: `${series.seriesTitle} · Season 1`,
      episodeSeasonLabel: "Season 1",
      episodeSeasonSort: 1,
    };
  }
  return {
    seasonLabel: d.seasonLabel || "Podcast",
    episodeSeasonLabel: "Season 1",
    episodeSeasonSort: 0,
  };
}

function docToPodcastEpisode(d: PodcastEpisodeDoc): PodcastEpisode {
  const slugCanon = inferSeriesFromSlugAllowlist(d.slug);
  const series = slugCanon
    ? { seriesKey: slugCanon.seriesKey, seriesTitle: slugCanon.seriesTitle }
    : inferSeriesFromLegacyEpisode(d);
  const seasonOrder = slugCanon?.seasonOrder ?? d.seasonOrder;
  const se = resolveEpisodeSeasonFields(d);
  const legacyRaw = d.legacyPermalink?.trim();
  return {
    slug: d.slug,
    title: decodeHtmlEntitiesLite(d.title),
    excerptHtml: normalizeBlogBodyHtml(d.excerptHtml ?? ""),
    date: formatPodcastDate(d.dateIso),
    dateIso: d.dateIso,
    seasonLabel: se.seasonLabel,
    seasonOrder,
    episodeSeasonLabel: se.episodeSeasonLabel,
    episodeSeasonSort: se.episodeSeasonSort,
    seriesKey: series.seriesKey,
    seriesTitle: series.seriesTitle,
    thumbnailUrl: normalizeOptionalStoredUrl(d.thumbnailUrl),
    youtubeVideoId:
      playlistYoutubeIdForPodcastSlug(d.slug) ?? d.youtubeVideoId,
    legacyPermalink: legacyRaw
      ? normalizeStoredSiteAbsoluteUrl(legacyRaw)
      : undefined,
  };
}

export async function getPodcastEpisodesFromFirestore(): Promise<PodcastEpisode[]> {
  getFirebaseAdmin();
  const db = getFirestore();
  const snap = await db.collection(COLLECTIONS.podcastEpisodes).get();
  const out: PodcastEpisode[] = [];
  snap.forEach((doc) => {
    const d = doc.data() as PodcastEpisodeDoc;
    out.push(docToPodcastEpisode(d));
  });
  out.sort(comparePodcastEpisodes);
  return out;
}

export async function getPodcastEpisodeBySlugFromFirestore(
  slug: string
): Promise<FullPodcastEpisode | null> {
  if (!slug) return null;
  getFirebaseAdmin();
  const db = getFirestore();
  const ref = await db.collection(COLLECTIONS.podcastEpisodes).doc(slug).get();
  if (!ref.exists) return null;
  const d = ref.data() as PodcastEpisodeDoc;
  const base = docToPodcastEpisode(d);
  return {
    ...base,
    excerptHtml: normalizeBlogBodyHtml(d.excerptHtml ?? ""),
    contentHtml: normalizeBlogBodyHtml(d.contentHtml ?? ""),
    thumbnailUrl: normalizeOptionalStoredUrl(d.thumbnailUrl),
    modified: d.modifiedIso ? formatPodcastDate(d.modifiedIso) : undefined,
    modifiedIso: d.modifiedIso,
  };
}

export async function getFaqFromFirestore(): Promise<FaqSection[]> {
  getFirebaseAdmin();
  const db = getFirestore();
  const ref = await db
    .collection(COLLECTIONS.resourcesFaq)
    .doc(RESOURCES_FAQ_DOC_ID)
    .get();
  if (!ref.exists) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_faq/data missing; using static FAQ_SECTIONS"
      );
    }
    return FAQ_SECTIONS;
  }
  const parsed = parseFaqFromDocData(
    ref.data() as Record<string, unknown> | undefined
  );
  if (!parsed?.length) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_faq/data could not parse faq; using static FAQ_SECTIONS. Keys:",
        Object.keys(ref.data() ?? {})
      );
    }
    return FAQ_SECTIONS;
  }
  return parsed;
}
