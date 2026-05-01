import { getFirestore } from "firebase-admin/firestore";
import type { PodcastEpisodeDoc } from "@/lib/firebase/types";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { SITE_URL } from "@/lib/constants";
import { isValidBlogSlug, slugifyBlogTitle } from "@/lib/create-content/blog-slug";
import {
  PODCAST_SERIES_META,
  PODCAST_WP_CATEGORY_OPR,
  PODCAST_WP_CATEGORY_UNEMPLOYABLE,
  type PodcastSeriesKey,
} from "@/lib/podcastTypes";

export type CreatePodcastInput = {
  slug?: string;
  title: string;
  excerptHtml: string;
  contentHtml: string;
  dateIso?: string;
  seriesKey: PodcastSeriesKey;
  youtubeVideoId?: string;
  thumbnailUrl?: string;
};

function resolveSeriesFields(seriesKey: PodcastSeriesKey): {
  seasonLabel: string;
  seasonOrder: number;
  wpCategoryIds: number[];
  seriesTitle: string;
  episodeSeasonLabel: string;
  episodeSeasonSort: number;
} {
  if (seriesKey === "opolis-public-radio") {
    const m = PODCAST_SERIES_META["opolis-public-radio"];
    return {
      seasonOrder: m.sortOrder,
      seasonLabel: `${m.title} · Season 1`,
      wpCategoryIds: [PODCAST_WP_CATEGORY_OPR],
      seriesTitle: m.title,
      episodeSeasonLabel: "Season 1",
      episodeSeasonSort: 1,
    };
  }
  if (seriesKey === "unemployable") {
    const m = PODCAST_SERIES_META.unemployable;
    return {
      seasonOrder: m.sortOrder,
      seasonLabel: `${m.title} · Season 2`,
      wpCategoryIds: [PODCAST_WP_CATEGORY_UNEMPLOYABLE],
      seriesTitle: m.title,
      episodeSeasonLabel: "Season 2",
      episodeSeasonSort: 2,
    };
  }
  const m = PODCAST_SERIES_META.unknown;
  return {
    seasonOrder: m.sortOrder,
    seasonLabel: "Podcast",
    wpCategoryIds: [],
    seriesTitle: m.title,
    episodeSeasonLabel: "Season 1",
    episodeSeasonSort: 0,
  };
}

export async function createPodcastEpisodeInFirestore(
  input: CreatePodcastInput
): Promise<{ slug: string }> {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  const excerptHtml = input.excerptHtml.trim();
  const contentHtml = input.contentHtml.trim();
  if (!excerptHtml) throw new Error("Excerpt is required");
  if (!contentHtml) throw new Error("Content is required");

  const slug = (input.slug?.trim() || slugifyBlogTitle(title)).toLowerCase();
  if (!isValidBlogSlug(slug)) throw new Error("Invalid slug");

  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.podcastEpisodes).doc(slug);
  const exists = await ref.get();
  if (exists.exists) throw new Error("An episode with this slug already exists");

  const seriesKey = input.seriesKey || "unemployable";
  const meta = resolveSeriesFields(seriesKey);
  const nowIso = new Date().toISOString();
  const dateIso = input.dateIso?.trim() || nowIso;

  const doc: PodcastEpisodeDoc = {
    slug,
    title,
    excerptHtml,
    contentHtml,
    dateIso,
    modifiedIso: nowIso,
    legacyPermalink: `${SITE_URL}/resources/podcasts/${slug}`,
    seasonLabel: meta.seasonLabel,
    seasonOrder: meta.seasonOrder,
    seriesKey,
    seriesTitle: meta.seriesTitle,
    wpCategoryIds: meta.wpCategoryIds,
    youtubeVideoId: input.youtubeVideoId?.trim() || undefined,
    thumbnailUrl: input.thumbnailUrl?.trim() || undefined,
    episodeSeasonLabel: meta.episodeSeasonLabel,
    episodeSeasonSort: meta.episodeSeasonSort,
    importedAt: nowIso,
    source: "cms",
  };

  await ref.set(doc);
  return { slug };
}

export async function updatePodcastEpisodeInFirestore(
  slug: string,
  input: CreatePodcastInput
): Promise<{ slug: string }> {
  const key = slug.trim().toLowerCase();
  if (!key) throw new Error("Slug is required");
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  const excerptHtml = input.excerptHtml.trim();
  const contentHtml = input.contentHtml.trim();
  if (!excerptHtml) throw new Error("Excerpt is required");
  if (!contentHtml) throw new Error("Content is required");

  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.podcastEpisodes).doc(key);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Episode not found");

  const prev = snap.data() as PodcastEpisodeDoc;
  const seriesKey = input.seriesKey || prev.seriesKey || "unemployable";
  const meta = resolveSeriesFields(seriesKey);
  const nowIso = new Date().toISOString();
  const dateIso = input.dateIso?.trim() || prev.dateIso;

  const doc: PodcastEpisodeDoc = {
    ...prev,
    slug: key,
    title,
    excerptHtml,
    contentHtml,
    dateIso,
    modifiedIso: nowIso,
    legacyPermalink: `${SITE_URL}/resources/podcasts/${key}`,
    seasonLabel: meta.seasonLabel,
    seasonOrder: meta.seasonOrder,
    seriesKey,
    seriesTitle: meta.seriesTitle,
    wpCategoryIds: meta.wpCategoryIds,
    youtubeVideoId: input.youtubeVideoId?.trim() || undefined,
    thumbnailUrl: input.thumbnailUrl?.trim() || undefined,
    episodeSeasonLabel: meta.episodeSeasonLabel,
    episodeSeasonSort: meta.episodeSeasonSort,
    source: prev.source === "wordpress" ? prev.source : "cms",
  };

  await ref.set(doc);
  return { slug: key };
}

export async function deletePodcastEpisodeFromFirestore(slug: string): Promise<void> {
  const key = slug.trim().toLowerCase();
  if (!key) throw new Error("Slug is required");
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.podcastEpisodes).doc(key);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Episode not found");
  await ref.delete();
}
