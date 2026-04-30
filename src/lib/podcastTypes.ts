/**
 * Podcast types and pure helpers — safe to import from Client Components.
 * Data loading lives in `podcasts.ts` (server only).
 */

import oprYoutubeBySlug from "../../data/podcast-opr-youtube-by-slug.json";
import unemployableYoutubeBySlug from "../../data/podcast-unemployable-youtube-by-slug.json";

/** Slugs with an official Opolis Public Radio playlist mapping (overrides WP categories when both apply). */
export const OPR_PLAYLIST_SLUGS = new Set(
  Object.keys(oprYoutubeBySlug.bySlug as Record<string, string>)
);

/** Slugs with an official Unemployable (Season 2) playlist mapping. */
export const UNEMPLOYABLE_PLAYLIST_SLUGS = new Set(
  Object.keys(unemployableYoutubeBySlug.bySlug as Record<string, string>)
);

/** WordPress category IDs on opolis.co — Unemployable (Season 2) & Opolis Public Radio (Season 1). */
export const PODCAST_WP_CATEGORY_UNEMPLOYABLE = 25;
export const PODCAST_WP_CATEGORY_OPR = 23;

export const PODCAST_WP_CATEGORY_IDS = [
  PODCAST_WP_CATEGORY_UNEMPLOYABLE,
  PODCAST_WP_CATEGORY_OPR,
] as const;

/** Stable series id for filtering, recommendations, and stored documents. */
export type PodcastSeriesKey =
  | "opolis-public-radio"
  | "unemployable"
  | "unknown";

export const PODCAST_SERIES_META: Record<
  PodcastSeriesKey,
  { title: string; shortLabel: string; sortOrder: number }
> = {
  "opolis-public-radio": {
    title: "Opolis Public Radio",
    shortLabel: "OPR",
    sortOrder: 1,
  },
  unemployable: {
    title: "Unemployable",
    shortLabel: "Unemployable",
    sortOrder: 2,
  },
  unknown: {
    title: "Podcast",
    shortLabel: "Podcast",
    sortOrder: 0,
  },
};

export interface PodcastEpisode {
  slug: string;
  title: string;
  excerptHtml: string;
  date: string;
  dateIso: string;
  /** Full line, e.g. “Unemployable · Season 2” or “Opolis Public Radio · Season 1”. */
  seasonLabel: string;
  seasonOrder: number;
  /** Within-series label (Unemployable S1/S2; OPR is a single run = Season 1). */
  episodeSeasonLabel: string;
  /** Sort Unemployable S2 before S1, then by date. OPR = 1. */
  episodeSeasonSort: number;
  /** Canonical series for UX and recommendations. */
  seriesKey: PodcastSeriesKey;
  /** Display name for the series (matches PODCAST_SERIES_META when known). */
  seriesTitle: string;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  legacyPermalink?: string;
}

export interface FullPodcastEpisode extends PodcastEpisode {
  contentHtml: string;
  modified?: string;
  /** ISO date for JSON-LD when available */
  modifiedIso?: string;
}

export function podcastEpisodePath(slug: string): string {
  return `/resources/podcasts/${encodeURIComponent(slug)}`;
}

/** Derive series + legacy season fields from WordPress category ids (Unemployable wins if both). */
export function seriesMetaFromWpCategories(catIds: number[]): {
  seriesKey: PodcastSeriesKey;
  seriesTitle: string;
  seasonOrder: number;
  seasonLabel: string;
} {
  if (catIds.includes(PODCAST_WP_CATEGORY_UNEMPLOYABLE)) {
    const { title } = PODCAST_SERIES_META.unemployable;
    return {
      seriesKey: "unemployable",
      seriesTitle: title,
      seasonOrder: 2,
      seasonLabel: title,
    };
  }
  if (catIds.includes(PODCAST_WP_CATEGORY_OPR)) {
    const { title } = PODCAST_SERIES_META["opolis-public-radio"];
    return {
      seriesKey: "opolis-public-radio",
      seriesTitle: title,
      seasonOrder: 1,
      seasonLabel: title,
    };
  }
  const { title } = PODCAST_SERIES_META.unknown;
  return {
    seriesKey: "unknown",
    seriesTitle: title,
    seasonOrder: 0,
    seasonLabel: "Podcast",
  };
}

/** Series + season order from curated playlist slug lists (else null). */
export function inferSeriesFromSlugAllowlist(slug: string): {
  seriesKey: PodcastSeriesKey;
  seriesTitle: string;
  seasonOrder: number;
} | null {
  if (OPR_PLAYLIST_SLUGS.has(slug)) {
    const k = "opolis-public-radio" as const;
    return {
      seriesKey: k,
      seriesTitle: PODCAST_SERIES_META[k].title,
      seasonOrder: 1,
    };
  }
  if (UNEMPLOYABLE_PLAYLIST_SLUGS.has(slug)) {
    const k = "unemployable" as const;
    return {
      seriesKey: k,
      seriesTitle: PODCAST_SERIES_META[k].title,
      seasonOrder: 2,
    };
  }
  return null;
}

/** Prefer playlist slug allowlists over WP categories (fixes dual-category posts). */
export function resolveSeriesBaseForSlug(
  slug: string,
  catIds: number[]
): ReturnType<typeof seriesMetaFromWpCategories> {
  const s = inferSeriesFromSlugAllowlist(slug);
  if (s) {
    return {
      seriesKey: s.seriesKey,
      seriesTitle: s.seriesTitle,
      seasonOrder: s.seasonOrder,
      seasonLabel: s.seriesTitle,
    };
  }
  return seriesMetaFromWpCategories(catIds);
}

export type WpCategoryLite = { slug: string; name: string };

/**
 * Unemployable-only: Season 1 vs Season 2. Uses explicit WP category ids if set,
 * then category name/slug hints, then publish date vs season2StartIso.
 */
export function unemployableEpisodeSeason(
  dateIso: string,
  categoryIds: number[],
  categoriesById: Map<number, WpCategoryLite>,
  season2StartIso: string,
  explicitCatIds?: { s1?: number; s2?: number }
): { episodeSeasonLabel: string; episodeSeasonSort: number } {
  if (
    explicitCatIds?.s2 != null &&
    categoryIds.includes(explicitCatIds.s2)
  ) {
    return { episodeSeasonLabel: "Season 2", episodeSeasonSort: 2 };
  }
  if (
    explicitCatIds?.s1 != null &&
    categoryIds.includes(explicitCatIds.s1)
  ) {
    return { episodeSeasonLabel: "Season 1", episodeSeasonSort: 1 };
  }

  for (const id of categoryIds) {
    const c = categoriesById.get(id);
    if (!c) continue;
    const t = `${c.slug} ${c.name}`.toLowerCase();
    if (
      /\bseason\s*2\b|season-2|unemployable.*season\s*2|\bu-?s2\b/.test(t)
    ) {
      return { episodeSeasonLabel: "Season 2", episodeSeasonSort: 2 };
    }
    if (
      /\bseason\s*1\b|season-1|unemployable.*season\s*1|\bu-?s1\b/.test(t)
    ) {
      return { episodeSeasonLabel: "Season 1", episodeSeasonSort: 1 };
    }
  }

  const cutoff = new Date(season2StartIso);
  const d = new Date(dateIso);
  if (
    !Number.isNaN(cutoff.getTime()) &&
    !Number.isNaN(d.getTime()) &&
    d >= cutoff
  ) {
    return { episodeSeasonLabel: "Season 2", episodeSeasonSort: 2 };
  }
  return { episodeSeasonLabel: "Season 1", episodeSeasonSort: 1 };
}

/** Legacy Firestore docs without per-episode season: date-only split (no WP category map). */
export function unemployableEpisodeSeasonLegacyDateOnly(
  dateIso: string,
  season2StartIso: string
): { episodeSeasonLabel: string; episodeSeasonSort: number } {
  return unemployableEpisodeSeason(
    dateIso,
    [],
    new Map(),
    season2StartIso,
    undefined
  );
}

/** Fill seasonLabel + episode season fields after `resolveSeriesBaseForSlug`. */
export function enrichPodcastEpisodeSeasonFields(
  slug: string,
  base: ReturnType<typeof seriesMetaFromWpCategories>,
  dateIso: string,
  catIds: number[],
  catMap: Map<number, WpCategoryLite>,
  opts: { season2StartIso: string; s1?: number; s2?: number }
): { seasonLabel: string; episodeSeasonLabel: string; episodeSeasonSort: number } {
  if (base.seriesKey === "unemployable") {
    if (UNEMPLOYABLE_PLAYLIST_SLUGS.has(slug)) {
      return {
        seasonLabel: `${base.seriesTitle} · Season 2`,
        episodeSeasonLabel: "Season 2",
        episodeSeasonSort: 2,
      };
    }
    const u = unemployableEpisodeSeason(
      dateIso,
      catIds,
      catMap,
      opts.season2StartIso,
      { s1: opts.s1, s2: opts.s2 }
    );
    return {
      seasonLabel: `${base.seriesTitle} · ${u.episodeSeasonLabel}`,
      episodeSeasonLabel: u.episodeSeasonLabel,
      episodeSeasonSort: u.episodeSeasonSort,
    };
  }
  if (base.seriesKey === "opolis-public-radio") {
    return {
      seasonLabel: `${base.seriesTitle} · Season 1`,
      episodeSeasonLabel: "Season 1",
      episodeSeasonSort: 1,
    };
  }
  return {
    seasonLabel: base.seasonLabel,
    episodeSeasonLabel: "Season 1",
    episodeSeasonSort: 0,
  };
}

/** Resolve series when older Firestore docs omit seriesKey / seriesTitle. */
export function inferSeriesFromLegacyEpisode(d: {
  seriesKey?: PodcastSeriesKey;
  seriesTitle?: string;
  seasonOrder?: number;
}): { seriesKey: PodcastSeriesKey; seriesTitle: string } {
  if (d.seriesKey && d.seriesTitle) {
    return { seriesKey: d.seriesKey, seriesTitle: d.seriesTitle };
  }
  if (d.seriesKey) {
    const meta = PODCAST_SERIES_META[d.seriesKey];
    return { seriesKey: d.seriesKey, seriesTitle: meta.title };
  }
  const order = d.seasonOrder ?? 0;
  if (order === 1) {
    const k = "opolis-public-radio" as const;
    return { seriesKey: k, seriesTitle: PODCAST_SERIES_META[k].title };
  }
  if (order === 2) {
    const k = "unemployable" as const;
    return { seriesKey: k, seriesTitle: PODCAST_SERIES_META[k].title };
  }
  return {
    seriesKey: "unknown",
    seriesTitle: PODCAST_SERIES_META.unknown.title,
  };
}

/** Same series first (newest first), excluding one slug. */
export function podcastEpisodesInSeries(
  episodes: PodcastEpisode[],
  seriesKey: PodcastSeriesKey,
  excludeSlug: string,
  limit: number
): PodcastEpisode[] {
  if (seriesKey === "unknown") return [];
  return episodes
    .filter((e) => e.slug !== excludeSlug && e.seriesKey === seriesKey)
    .sort((a, b) => (b.dateIso || "").localeCompare(a.dateIso || ""))
    .slice(0, limit);
}

/** Other series, newest first (for “explore” suggestions). */
export function podcastEpisodesOutsideSeries(
  episodes: PodcastEpisode[],
  seriesKey: PodcastSeriesKey,
  excludeSlug: string,
  limit: number
): PodcastEpisode[] {
  return episodes
    .filter((e) => e.slug !== excludeSlug && e.seriesKey !== seriesKey)
    .sort((a, b) => (b.dateIso || "").localeCompare(a.dateIso || ""))
    .slice(0, limit);
}

const YT_ID = /^[a-zA-Z0-9_-]{11}$/;

function isYoutubeId(s: string | undefined): s is string {
  return !!s && YT_ID.test(s);
}

/** First-pass extraction from any text chunk (HTML fragment or iframe URL). */
function extractYoutubeVideoIdFromText(chunk: string): string | undefined {
  if (!chunk) return undefined;
  const text = chunk.replace(/&amp;/gi, "&");

  const embedShortcode = text.match(
    /\[\s*embed\s*\]\s*(https?:\/\/[^\s[\]]+)\s*\[\s*\/\s*embed\s*\]/i
  );
  if (embedShortcode?.[1]) {
    const fromUrl = extractYoutubeVideoIdFromText(embedShortcode[1]);
    if (fromUrl) return fromUrl;
  }

  const ytimg = text.match(
    /(?:i\.ytimg\.com|img\.youtube\.com)\/vi\/([a-zA-Z0-9_-]{11})\//i
  );
  if (isYoutubeId(ytimg?.[1])) return ytimg![1];

  const vParam = text.match(/[?&#]v=([a-zA-Z0-9_-]{11})\b/);
  if (isYoutubeId(vParam?.[1])) return vParam![1];

  const embed = text.match(
    /youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})\b/
  );
  if (isYoutubeId(embed?.[1])) return embed![1];

  const live = text.match(/youtube(?:-nocookie)?\.com\/live\/([a-zA-Z0-9_-]{11})\b/);
  if (isYoutubeId(live?.[1])) return live![1];

  const shorts = text.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})\b/);
  if (isYoutubeId(shorts?.[1])) return shorts![1];

  const shortLink = text.match(/youtu\.be\/([a-zA-Z0-9_-]{11})\b/);
  if (isYoutubeId(shortLink?.[1])) return shortLink![1];

  return undefined;
}

/**
 * Extract YouTube video id from HTML, excerpt, or thumbnail URL.
 * Handles embed/watch/shorts/live, query `v=`, all iframe `src` / `data-src`, and ytimg thumbs.
 */
export function extractYoutubeVideoId(html: string): string | undefined {
  if (!html) return undefined;

  const direct = extractYoutubeVideoIdFromText(html);
  if (direct) return direct;

  const normalized = html.replace(/&amp;/gi, "&");
  const iframeRe =
    /<iframe\b[^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = iframeRe.exec(normalized)) !== null) {
    const fromFrame = extractYoutubeVideoIdFromText(m[1]);
    if (fromFrame) return fromFrame;
  }

  return undefined;
}

export function comparePodcastEpisodes(
  a: PodcastEpisode,
  b: PodcastEpisode
): number {
  if (b.seasonOrder !== a.seasonOrder) {
    return b.seasonOrder - a.seasonOrder;
  }
  if (
    a.seriesKey === "unemployable" &&
    b.seriesKey === "unemployable" &&
    b.episodeSeasonSort !== a.episodeSeasonSort
  ) {
    return b.episodeSeasonSort - a.episodeSeasonSort;
  }
  return (b.dateIso || "").localeCompare(a.dateIso || "");
}
