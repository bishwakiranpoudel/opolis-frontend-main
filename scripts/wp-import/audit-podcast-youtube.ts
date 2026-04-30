/**
 * Compare WordPress vs Firestore YouTube ids for podcast episodes.
 * Usage: npx tsx scripts/wp-import/audit-podcast-youtube.ts
 */

import "./config";
import { requireWordPressUrl } from "./config";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { PodcastEpisodeDoc } from "../../src/lib/firebase/types";
import {
  extractYoutubeVideoId,
  PODCAST_WP_CATEGORY_IDS,
} from "../../src/lib/podcastTypes";
import { fetchMediaItem, fetchPostsForCategories } from "./wp-client";

async function main() {
  requireWordPressUrl();
  getFirebaseAdmin();
  const db = getFirestore();
  const posts = await fetchPostsForCategories(PODCAST_WP_CATEGORY_IDS);

  const rows: string[] = [];
  let missingWp = 0;
  let mismatch = 0;

  for (const post of posts) {
    const slug = post.slug || `wp-${post.id}`;
    let featured = "";
    if (post.featured_media) {
      const media = await fetchMediaItem(post.featured_media);
      if (media?.source_url) featured = media.source_url;
    }
    const raw = post.content?.rendered ?? "";
    const excerpt = post.excerpt?.rendered ?? "";
    const wpYt = extractYoutubeVideoId([raw, excerpt, featured].join("\n"));

    const snap = await db.collection(COLLECTIONS.podcastEpisodes).doc(slug).get();
    const fsYt = snap.exists
      ? (snap.data() as PodcastEpisodeDoc).youtubeVideoId
      : undefined;
    const fsLabel = !snap.exists
      ? "(no document)"
      : fsYt ?? "(no youtubeVideoId field)";

    if (!wpYt) missingWp += 1;
    if (wpYt && fsYt && wpYt !== fsYt) mismatch += 1;
    if (!wpYt || !fsYt || wpYt !== fsYt) {
      rows.push(`${slug}\twp=${wpYt ?? "(none)"}\tfirestore=${fsLabel}`);
    }
  }

  console.log(
    `Audited ${posts.length} WP podcast posts. No id in WP HTML: ${missingWp}. WP≠FS id: ${mismatch}.`
  );
  if (rows.length) {
    console.log("\nEpisodes needing attention (slug, wp extract, firestore field):\n");
    console.log(rows.join("\n"));
  }
  console.log(
    "\nAfter code/fixtures change, run: npx tsx scripts/wp-import/import-podcasts.ts --force"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
