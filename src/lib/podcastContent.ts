/**
 * Podcast HTML and navigation helpers (pure, safe for client or server).
 */

import type { PodcastEpisode } from "@/lib/podcastTypes";

/** Decode common WordPress / HTML entities in titles and plain text. */
export function decodeHtmlEntitiesLite(text: string): string {
  if (!text) return text;
  let s = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/g, "'");
  s = s.replace(/&#(\d+);/g, (_, n) => {
    const code = parseInt(n, 10);
    return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : _;
  });
  s = s.replace(/&#x([0-9a-fA-F]+);/g, (_, h) => {
    const code = parseInt(h, 16);
    return code > 0 && code < 0x110000 ? String.fromCodePoint(code) : _;
  });
  return s;
}

/**
 * Point legacy opolis.co / www links at the configured site origin (NEXT_PUBLIC_SITE_URL).
 * Does not rewrite external domains (e.g. youtube.com).
 */
export function rewriteLegacyOpolisLinks(html: string, siteOrigin: string): string {
  if (!html) return html;
  const base = siteOrigin.replace(/\/$/, "");
  let out = html;
  out = out.replace(/https?:\/\/(?:www\.)?opolis\.co/gi, base);
  try {
    const u = new URL(base);
    const protoHost = `${u.protocol}//${u.host}`;
    out = out.replace(/\/\/(?:www\.)?opolis\.co/g, protoHost);
  } catch {
    /* keep partial rewrites */
  }
  /* WP podcast permalinks used /unemployable/{slug}; site route is /resources/podcasts/{slug}. */
  out = out.replace(/\/unemployable\//gi, "/resources/podcasts/");
  return out;
}

/**
 * Fixes HTML or plain URLs that were saved with a dev origin (common when
 * `wp:apply-url-map` or imports ran with `NEXT_PUBLIC_SITE_URL=http://localhost:3000`).
 */
export function rewriteStoredDevOrigin(html: string, siteOrigin: string): string {
  if (!html) return html;
  const base = siteOrigin.replace(/\/$/, "");
  return html.replace(/https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/gi, base);
}

/** Oldest → newest by publish date (for prev/next). */
export function sortPodcastsChronological(
  episodes: PodcastEpisode[]
): PodcastEpisode[] {
  return [...episodes].sort((a, b) =>
    (a.dateIso || "").localeCompare(b.dateIso || "")
  );
}

export function getPodcastNeighbors(
  chronological: PodcastEpisode[],
  slug: string
): {
  older: PodcastEpisode | null;
  newer: PodcastEpisode | null;
} {
  const i = chronological.findIndex((e) => e.slug === slug);
  if (i === -1) {
    return { older: null, newer: null };
  }
  return {
    older: chronological[i - 1] ?? null,
    newer: chronological[i + 1] ?? null,
  };
}

/** Remove first iframe embed for this video id to avoid duplicate with hero embed. */
export function stripFirstYoutubeIframeForId(
  html: string,
  videoId: string
): string {
  if (!html || !videoId) return html;
  const esc = videoId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return html.replace(
    new RegExp(
      `<iframe[\\s\\S]*?youtube(?:-nocookie)?\\.com/embed/${esc}[\\s\\S]*?<\\/iframe>`,
      "i"
    ),
    ""
  );
}

/** Remove all iframes that load YouTube (hero embed replaces unreliable WP iframes). */
export function stripAllYoutubeIframes(html: string): string {
  if (!html) return html;
  return html.replace(
    /<iframe\b[^>]*\b(?:src|data-src)\s*=\s*["'][^"']*(?:youtube|youtu\.be)[^"']*["'][^>]*>[\s\S]*?<\/iframe>/gi,
    ""
  );
}
