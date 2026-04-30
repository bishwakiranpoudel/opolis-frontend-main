/**
 * Podcast episodes: Firestore (after import) or WordPress REST for legacy categories.
 * Do not import this file from Client Components — use `podcastTypes.ts` for types and paths.
 */

import { getContentSource } from "@/lib/content-source";
import type { FullPodcastEpisode, PodcastEpisode } from "@/lib/podcastTypes";

export type { FullPodcastEpisode, PodcastEpisode } from "@/lib/podcastTypes";
export {
  comparePodcastEpisodes,
  enrichPodcastEpisodeSeasonFields,
  extractYoutubeVideoId,
  inferSeriesFromLegacyEpisode,
  inferSeriesFromSlugAllowlist,
  OPR_PLAYLIST_SLUGS,
  podcastEpisodePath,
  podcastEpisodesInSeries,
  podcastEpisodesOutsideSeries,
  PODCAST_SERIES_META,
  PODCAST_WP_CATEGORY_IDS,
  PODCAST_WP_CATEGORY_OPR,
  PODCAST_WP_CATEGORY_UNEMPLOYABLE,
  resolveSeriesBaseForSlug,
  seriesMetaFromWpCategories,
  UNEMPLOYABLE_PLAYLIST_SLUGS,
  unemployableEpisodeSeason,
  type PodcastSeriesKey,
} from "@/lib/podcastTypes";

export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  if (getContentSource() === "firestore") {
    try {
      const { getPodcastEpisodesFromFirestore } = await import(
        "@/lib/firestore-content"
      );
      return await getPodcastEpisodesFromFirestore();
    } catch (err) {
      console.error("[Firestore] getPodcastEpisodes:", err);
      return [];
    }
  }

  try {
    const { getPodcastEpisodesFromWordPress } = await import(
      "@/lib/wordpressPodcasts"
    );
    return await getPodcastEpisodesFromWordPress();
  } catch (err) {
    console.error("[WordPress] getPodcastEpisodes:", err);
    return [];
  }
}

export async function getPodcastEpisodeBySlug(
  slug: string
): Promise<FullPodcastEpisode | null> {
  if (!slug) return null;
  if (getContentSource() === "firestore") {
    try {
      const { getPodcastEpisodeBySlugFromFirestore } = await import(
        "@/lib/firestore-content"
      );
      return await getPodcastEpisodeBySlugFromFirestore(slug);
    } catch (err) {
      console.error("[Firestore] getPodcastEpisodeBySlug:", err);
      return null;
    }
  }

  try {
    const { getPodcastEpisodeBySlugFromWordPress } = await import(
      "@/lib/wordpressPodcasts"
    );
    return await getPodcastEpisodeBySlugFromWordPress(slug);
  } catch (err) {
    console.error("[WordPress] getPodcastEpisodeBySlug:", err);
    return null;
  }
}
