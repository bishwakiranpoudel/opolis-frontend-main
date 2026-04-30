/**
 * Curated YouTube ids by WP episode slug:
 * - Unemployable S2: `data/podcast-unemployable-youtube-by-slug.json`
 * - Opolis Public Radio: `data/podcast-opr-youtube-by-slug.json`
 * Overrides WP/Firestore extraction when the site HTML lacks embeds.
 */

import opr from "../../data/podcast-opr-youtube-by-slug.json";
import map from "../../data/podcast-unemployable-youtube-by-slug.json";

const BY_SLUG = {
  ...(map.bySlug as Record<string, string>),
  ...(opr.bySlug as Record<string, string>),
} as Record<string, string>;

export function playlistYoutubeIdForPodcastSlug(
  slug: string | undefined
): string | undefined {
  if (!slug) return undefined;
  const id = BY_SLUG[slug];
  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : undefined;
}
