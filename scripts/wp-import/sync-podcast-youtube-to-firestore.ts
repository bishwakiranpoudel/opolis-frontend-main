/**
 * One-time / occasional: align Firestore podcast docs with curated playlists:
 * `youtubeVideoId`, `seriesKey`, `seriesTitle`, `seasonOrder`, `seasonLabel`,
 * `episodeSeasonLabel`, `episodeSeasonSort` when the slug is in
 * `data/podcast-unemployable-youtube-by-slug.json` or
 * `data/podcast-opr-youtube-by-slug.json`.
 *
 * Usage: npx tsx scripts/wp-import/sync-podcast-youtube-to-firestore.ts
 */

import "./config";
import type { DocumentReference } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { PodcastEpisodeDoc } from "../../src/lib/firebase/types";
import {
  inferSeriesFromSlugAllowlist,
  PODCAST_SERIES_META,
} from "../../src/lib/podcastTypes";
import { playlistYoutubeIdForPodcastSlug } from "../../src/lib/podcastYoutubeSlugMap";

const BATCH_MAX = 450;

function canonicalEpisodePatch(
  d: PodcastEpisodeDoc
): Partial<PodcastEpisodeDoc> | null {
  const patch: Partial<PodcastEpisodeDoc> = {};
  const yt = playlistYoutubeIdForPodcastSlug(d.slug);
  if (yt && yt !== d.youtubeVideoId) {
    patch.youtubeVideoId = yt;
  }

  const canon = inferSeriesFromSlugAllowlist(d.slug);
  if (canon) {
    const meta = PODCAST_SERIES_META[canon.seriesKey];
    const seasonLabel =
      canon.seriesKey === "opolis-public-radio"
        ? `${meta.title} · Season 1`
        : `${meta.title} · Season 2`;
    const episodeSeasonLabel =
      canon.seriesKey === "opolis-public-radio" ? "Season 1" : "Season 2";
    const episodeSeasonSort =
      canon.seriesKey === "opolis-public-radio" ? 1 : 2;

    if (d.seriesKey !== canon.seriesKey) patch.seriesKey = canon.seriesKey;
    if (d.seriesTitle !== canon.seriesTitle)
      patch.seriesTitle = canon.seriesTitle;
    if (d.seasonOrder !== canon.seasonOrder)
      patch.seasonOrder = canon.seasonOrder;
    if (d.seasonLabel !== seasonLabel) patch.seasonLabel = seasonLabel;
    if (d.episodeSeasonLabel !== episodeSeasonLabel) {
      patch.episodeSeasonLabel = episodeSeasonLabel;
    }
    if (d.episodeSeasonSort !== episodeSeasonSort) {
      patch.episodeSeasonSort = episodeSeasonSort;
    }
  }

  return Object.keys(patch).length ? patch : null;
}

async function main() {
  getFirebaseAdmin();
  const db = getFirestore();
  const snap = await db.collection(COLLECTIONS.podcastEpisodes).get();

  type Op = { ref: DocumentReference; patch: Partial<PodcastEpisodeDoc> };
  const ops: Op[] = [];

  snap.forEach((doc) => {
    const d = doc.data() as PodcastEpisodeDoc;
    const patch = canonicalEpisodePatch(d);
    if (patch) ops.push({ ref: doc.ref, patch });
  });

  let committed = 0;
  for (let i = 0; i < ops.length; i += BATCH_MAX) {
    const chunk = ops.slice(i, i + BATCH_MAX);
    const batch = db.batch();
    for (const { ref, patch } of chunk) {
      batch.update(ref, patch);
    }
    await batch.commit();
    committed += chunk.length;
  }

  console.log(
    `Updated ${committed} podcast_episodes doc(s) (YouTube id and/or canonical series fields). Skipped when nothing to change.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
