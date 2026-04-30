/**
 * Replace legacy opolis.co paths inside Firestore content using resolved URL mappings:
 * - Reads `url_map_pending` (non-null `suggestedNewPath`)
 * - Merges non-empty rows from `data/url-map-unresolved.json`
 * - Updates `blog_posts`, `podcast_episodes`, `resources_guides/data`, `resources_faq/data`
 *
 * Usage: npx tsx scripts/wp-import/apply-url-map-to-firestore.ts [--dry-run]
 */

import "./config";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import {
  COLLECTIONS,
  RESOURCES_FAQ_DOC_ID,
  RESOURCES_GUIDES_DOC_ID,
} from "../../src/lib/firebase/schema";
import type {
  BlogPostDoc,
  PodcastEpisodeDoc,
  UrlMapPendingDoc,
} from "../../src/lib/firebase/types";
import { SITE_URL } from "../../src/lib/constants";
import { rewriteLegacyOpolisLinks } from "../../src/lib/podcastContent";
import {
  mergeUnresolvedJsonIntoPathMap,
  pathnameTargetMapFromPendingRows,
  rewriteHtmlOpolisUrlMap,
  rewriteLegacyPermalinkField,
  rewriteResourcesFaqPayload,
  rewriteResourcesGuidesPayload,
} from "../../src/lib/urlMapFirestoreRewrite";

const dryRun = process.argv.includes("--dry-run");

const UNRESOLVED_JSON = path.join(
  process.cwd(),
  "data",
  "url-map-unresolved.json"
);

function loadUnresolvedMappings(): { oldPath?: string; newPath?: string }[] {
  if (!fs.existsSync(UNRESOLVED_JSON)) return [];
  try {
    const parsed = JSON.parse(
      fs.readFileSync(UNRESOLVED_JSON, "utf8")
    ) as { mappings?: { oldPath?: string; newPath?: string }[] };
    return Array.isArray(parsed.mappings) ? parsed.mappings : [];
  } catch {
    return [];
  }
}

function contentHashHex(html: string, modifiedOrDate: string): string {
  return createHash("sha256")
    .update(html + modifiedOrDate)
    .digest("hex");
}

function pipeHtml(html: string, pathMap: Map<string, string>): string {
  let out = rewriteHtmlOpolisUrlMap(html, pathMap, SITE_URL);
  out = rewriteLegacyOpolisLinks(out, SITE_URL);
  return out;
}

async function main() {
  getFirebaseAdmin();
  const db = getFirestore();

  const pendingSnap = await db.collection(COLLECTIONS.urlMapPending).get();
  const rows: UrlMapPendingDoc[] = pendingSnap.docs.map(
    (d) => d.data() as UrlMapPendingDoc
  );
  const pathMap = pathnameTargetMapFromPendingRows(rows);
  mergeUnresolvedJsonIntoPathMap(pathMap, loadUnresolvedMappings());

  if (pathMap.size === 0) {
    console.log("No pathname targets (empty suggestedNewPath everywhere). Run wp:fill-url-map first.");
    return;
  }

  console.log(`Pathname mappings: ${pathMap.size} (pending + unresolved JSON)`);

  let blogUpdated = 0;
  let podcastUpdated = 0;
  let guidesUpdated = 0;
  let faqUpdated = 0;

  const blogSnap = await db.collection(COLLECTIONS.blogPosts).get();
  const bw = !dryRun ? db.bulkWriter() : null;

  for (const doc of blogSnap.docs) {
    const d = doc.data() as BlogPostDoc;
    const nextContent = pipeHtml(d.contentHtml ?? "", pathMap);
    const nextExcerpt = pipeHtml(d.excerptHtml ?? "", pathMap);
    const nextLegacy = rewriteLegacyPermalinkField(
      d.legacyPermalink ?? "",
      pathMap,
      SITE_URL
    );
    const blogChanged =
      nextContent !== (d.contentHtml ?? "") ||
      nextExcerpt !== (d.excerptHtml ?? "") ||
      nextLegacy !== (d.legacyPermalink ?? "");

    if (!blogChanged) continue;

    blogUpdated += 1;
    const mod = d.modifiedIso ?? d.dateIso ?? "";
    const patch: Partial<BlogPostDoc> = {
      contentHtml: nextContent,
      excerptHtml: nextExcerpt,
      legacyPermalink: nextLegacy,
      contentHash: contentHashHex(nextContent, mod),
    };

    if (bw) {
      bw.update(doc.ref, patch);
    }
  }

  const podSnap = await db.collection(COLLECTIONS.podcastEpisodes).get();
  for (const doc of podSnap.docs) {
    const d = doc.data() as PodcastEpisodeDoc;
    const nextContent = pipeHtml(d.contentHtml ?? "", pathMap);
    const nextExcerpt = pipeHtml(d.excerptHtml ?? "", pathMap);
    const nextLegacy = rewriteLegacyPermalinkField(
      d.legacyPermalink ?? "",
      pathMap,
      SITE_URL
    );
    const podChanged =
      nextContent !== (d.contentHtml ?? "") ||
      nextExcerpt !== (d.excerptHtml ?? "") ||
      nextLegacy !== (d.legacyPermalink ?? "");

    if (!podChanged) continue;

    podcastUpdated += 1;
    const mod = d.modifiedIso ?? d.dateIso ?? "";
    const patch: Partial<PodcastEpisodeDoc> = {
      contentHtml: nextContent,
      excerptHtml: nextExcerpt,
      legacyPermalink: nextLegacy,
      contentHash: contentHashHex(nextContent, mod),
    };

    if (bw) {
      bw.update(doc.ref, patch);
    }
  }

  const guidesRef = db
    .collection(COLLECTIONS.resourcesGuides)
    .doc(RESOURCES_GUIDES_DOC_ID);
  const guidesSnap = await guidesRef.get();
  if (guidesSnap.exists) {
    const raw = guidesSnap.data() as Record<string, unknown>;
    const next = rewriteResourcesGuidesPayload(raw, pathMap, SITE_URL);
    if (JSON.stringify(next) !== JSON.stringify(raw)) {
      guidesUpdated = 1;
      if (bw) bw.update(guidesRef, next as Record<string, unknown>);
    }
  }

  const faqRef = db.collection(COLLECTIONS.resourcesFaq).doc(RESOURCES_FAQ_DOC_ID);
  const faqSnap = await faqRef.get();
  if (faqSnap.exists) {
    const raw = faqSnap.data() as Record<string, unknown>;
    const next = rewriteResourcesFaqPayload(raw, pathMap, SITE_URL);
    if (JSON.stringify(next) !== JSON.stringify(raw)) {
      faqUpdated = 1;
      if (bw) bw.update(faqRef, next as Record<string, unknown>);
    }
  }

  if (bw) {
    await bw.close();
  }

  console.log(
    dryRun
      ? `[dry-run] Would update blog_posts=${blogUpdated}, podcast_episodes=${podcastUpdated}, guides=${guidesUpdated}, faq=${faqUpdated}`
      : `Updated blog_posts=${blogUpdated}, podcast_episodes=${podcastUpdated}, guides=${guidesUpdated}, faq=${faqUpdated}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
