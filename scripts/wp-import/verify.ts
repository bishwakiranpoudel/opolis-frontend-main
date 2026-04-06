/**
 * Verify Firestore + Storage vs WordPress counts and spot-check media_map.
 * Usage: npx tsx scripts/wp-import/verify.ts
 */

import "./config";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { BlogPostDoc } from "../../src/lib/firebase/types";
import {
  countMediaItems,
  fetchAllPostsFull,
} from "./wp-client";
import { FIREBASE_STORAGE_BUCKET, requireWordPressUrl } from "./config";

async function main() {
  requireWordPressUrl();
  if (!FIREBASE_STORAGE_BUCKET) {
    throw new Error("Set FIREBASE_STORAGE_BUCKET");
  }

  getFirebaseAdmin();
  const db = getFirestore();
  const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);

  const wpPosts = await fetchAllPostsFull();
  const wpMediaTotal = await countMediaItems();

  const postsSnap = await db.collection(COLLECTIONS.blogPosts).get();
  const mediaMapSnap = await db.collection(COLLECTIONS.mediaMap).get();

  const orphans: string[] = [];
  const sample = postsSnap.docs.slice(0, 5);

  for (const d of sample) {
    const p = d.data() as BlogPostDoc;
    if (p.contentHtml?.includes("wp-content/uploads") && !p.contentHtml.includes("storage.googleapis.com")) {
      orphans.push(`${d.id}: still references wp-content`);
    }
  }

  let storageMissing = 0;
  for (const doc of mediaMapSnap.docs.slice(0, 50)) {
    const path = doc.data()?.storagePath as string | undefined;
    if (!path) continue;
    const [exists] = await bucket.file(path).exists();
    if (!exists) storageMissing += 1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    wordpress: {
      posts: wpPosts.length,
      mediaLibraryTotal: wpMediaTotal,
    },
    firestore: {
      blogPosts: postsSnap.size,
      mediaMap: mediaMapSnap.size,
    },
    checks: {
      postCountMatch: postsSnap.size === wpPosts.length,
      sampleWpContentUrls: orphans,
      missingStorageAmongFirst50MediaMap: storageMissing,
    },
  };

  console.log(JSON.stringify(report, null, 2));

  if (!report.checks.postCountMatch) {
    console.warn(
      "Post count mismatch: re-run import-posts or check drafts/trash in WP."
    );
  }
  if (orphans.length) {
    console.warn("Sample posts may still reference WordPress URLs:", orphans);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
