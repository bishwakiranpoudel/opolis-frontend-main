/**
 * Align `media_map` with Firebase Storage: `wpUrl` and `publicUrl` become the canonical
 * `https://storage.googleapis.com/{bucket}/{encodedPath}` from `storagePath`, and
 * `sourceWpUrl` is backfilled from a legacy WordPress `wpUrl` when still present.
 * Optionally rewrites those URLs inside blog/podcast HTML, featured/thumbnail fields,
 * and resources guides/FAQ payloads (same pairs, longest-first).
 *
 * Usage:
 *   npx tsx scripts/wp-import/sync-media-map-to-storage.ts           # dry-run summary
 *   npx tsx scripts/wp-import/sync-media-map-to-storage.ts --apply   # write Firestore
 *   ... --skip-html   # only patch `media_map`
 */

import "./config";
import { createHash } from "node:crypto";
import type { DocumentReference } from "firebase-admin/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import {
  COLLECTIONS,
  RESOURCES_FAQ_DOC_ID,
  RESOURCES_GUIDES_DOC_ID,
} from "../../src/lib/firebase/schema";
import type {
  BlogPostDoc,
  MediaMapDoc,
  PodcastEpisodeDoc,
} from "../../src/lib/firebase/types";
import { FIREBASE_STORAGE_BUCKET } from "./config";
import { gcsPublicUrl } from "./lib/storage-upload";

const apply = process.argv.includes("--apply");
const skipHtml = process.argv.includes("--skip-html");

function isLikelyStoragePublicUrl(u: string): boolean {
  try {
    const h = new URL(u).hostname;
    return h === "storage.googleapis.com" || h.endsWith(".firebasestorage.app");
  } catch {
    return false;
  }
}

function contentHashHex(html: string, modifiedOrDate: string): string {
  return createHash("sha256").update(html + modifiedOrDate).digest("hex");
}

type Pair = { from: string; to: string };

function addPair(pairs: Pair[], from: string, to: string) {
  if (!from || !to || from === to) return;
  pairs.push({ from, to });
}

function expandProtocolVariants(pairs: Pair[]): Pair[] {
  const extra: Pair[] = [];
  for (const p of pairs) {
    if (p.from.startsWith("https://")) {
      extra.push({
        from: `http://${p.from.slice("https://".length)}`,
        to: `http://${p.to.slice("https://".length)}`,
      });
    }
  }
  return [...pairs, ...extra];
}

function dedupeAndSortPairs(pairs: Pair[]): Pair[] {
  const m = new Map<string, string>();
  for (const p of pairs) {
    const prev = m.get(p.from);
    if (prev !== undefined && prev !== p.to) {
      console.warn(`Pair conflict for ${p.from.slice(0, 96)}…`);
    }
    m.set(p.from, p.to);
  }
  return [...m.entries()]
    .map(([from, to]) => ({ from, to }))
    .sort((a, b) => b.from.length - a.from.length);
}

function rewriteWithPairs(s: string, pairs: Pair[]): string {
  let out = s;
  for (const { from, to } of pairs) {
    out = out.split(from).join(to);
  }
  return out;
}

function rewriteResourcesGuidesUrls(
  raw: Record<string, unknown>,
  pairs: Pair[]
): Record<string, unknown> {
  const guides = raw.guides;
  if (!Array.isArray(guides)) return raw;
  let changed = false;
  const nextGuides = guides.map((section: unknown) => {
    if (!section || typeof section !== "object") return section;
    const sec = section as Record<string, unknown>;
    const items = sec.items;
    if (!Array.isArray(items)) return section;
    const nextItems = items.map((item: unknown) => {
      if (!item || typeof item !== "object") return item;
      const it = item as Record<string, unknown>;
      if (typeof it.url !== "string") return item;
      const nu = rewriteWithPairs(it.url, pairs);
      if (nu !== it.url) changed = true;
      return { ...it, url: nu };
    });
    return { ...sec, items: nextItems };
  });
  if (!changed) return raw;
  return { ...raw, guides: nextGuides };
}

function rewriteResourcesFaqUrls(
  raw: Record<string, unknown>,
  pairs: Pair[]
): Record<string, unknown> {
  const faq = raw.faq;
  if (!Array.isArray(faq)) return raw;
  let changed = false;
  const nextFaq = faq.map((section: unknown) => {
    if (!section || typeof section !== "object") return section;
    const sec = section as Record<string, unknown>;
    const items = sec.items;
    if (!Array.isArray(items)) return section;
    const nextItems = items.map((item: unknown) => {
      if (!item || typeof item !== "object") return item;
      const it = item as Record<string, unknown>;
      const q = typeof it.q === "string" ? rewriteWithPairs(it.q, pairs) : it.q;
      const a = typeof it.a === "string" ? rewriteWithPairs(it.a, pairs) : it.a;
      if (q !== it.q || a !== it.a) changed = true;
      return { ...it, q, a };
    });
    return { ...sec, items: nextItems };
  });
  if (!changed) return raw;
  return { ...raw, faq: nextFaq };
}

async function main() {
  if (!FIREBASE_STORAGE_BUCKET) {
    throw new Error("Set FIREBASE_STORAGE_BUCKET in .env.local");
  }
  getFirebaseAdmin();
  const db = getFirestore();
  const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);

  const mediaSnap = await db.collection(COLLECTIONS.mediaMap).get();
  const pairAccum: Pair[] = [];
  let skippedNoPath = 0;
  let mediaRowsToUpdate = 0;

  const mediaPatches: { ref: DocumentReference; patch: Partial<MediaMapDoc> }[] = [];

  for (const doc of mediaSnap.docs) {
    const d = doc.data() as MediaMapDoc;
    if (!d.storagePath) {
      skippedNoPath += 1;
      continue;
    }
    const canonical = gcsPublicUrl(bucket.name, d.storagePath);
    const oldWpField = d.wpUrl ?? "";
    const oldPublic = d.publicUrl ?? "";

    const inferredSource =
      d.sourceWpUrl ??
      (oldWpField && !isLikelyStoragePublicUrl(oldWpField) ? oldWpField : undefined);

    const patch: Partial<MediaMapDoc> = {};
    if (oldWpField !== canonical) patch.wpUrl = canonical;
    if (oldPublic !== canonical) patch.publicUrl = canonical;
    if (inferredSource && inferredSource !== d.sourceWpUrl) {
      patch.sourceWpUrl = inferredSource;
    }

    if (Object.keys(patch).length === 0) continue;

    mediaRowsToUpdate += 1;
    if (apply) {
      mediaPatches.push({ ref: doc.ref, patch });
    }

    addPair(pairAccum, oldWpField, canonical);
    if (oldPublic && oldPublic !== oldWpField) {
      addPair(pairAccum, oldPublic, canonical);
    }
  }

  const pairs = dedupeAndSortPairs(expandProtocolVariants(pairAccum));

  console.log(
    JSON.stringify(
      {
        dryRun: !apply,
        skipHtml,
        mediaMapTotal: mediaSnap.size,
        mediaRowsWouldUpdate: mediaRowsToUpdate,
        skippedNoStoragePath: skippedNoPath,
        urlReplacementPairs: pairs.length,
      },
      null,
      2
    )
  );

  if (!apply) {
    console.log("Re-run with --apply to write Firestore.");
    return;
  }

  const chunk = 400;
  for (let i = 0; i < mediaPatches.length; i += chunk) {
    const batch = db.batch();
    for (const { ref, patch } of mediaPatches.slice(i, i + chunk)) {
      batch.update(ref, patch);
    }
    await batch.commit();
  }
  console.log(`Updated media_map rows: ${mediaPatches.length}`);

  if (skipHtml || pairs.length === 0) {
    return;
  }

  const bw = db.bulkWriter();
  let blogUpdated = 0;
  let podUpdated = 0;
  let guidesUpdated = 0;
  let faqUpdated = 0;

  const blogSnap = await db.collection(COLLECTIONS.blogPosts).get();
  for (const doc of blogSnap.docs) {
    const d = doc.data() as BlogPostDoc;
    const nextContent = rewriteWithPairs(d.contentHtml ?? "", pairs);
    const nextExcerpt = rewriteWithPairs(d.excerptHtml ?? "", pairs);
    const nextFeat = d.featuredImageUrl
      ? rewriteWithPairs(d.featuredImageUrl, pairs)
      : d.featuredImageUrl;
    const changed =
      nextContent !== (d.contentHtml ?? "") ||
      nextExcerpt !== (d.excerptHtml ?? "") ||
      nextFeat !== d.featuredImageUrl;
    if (!changed) continue;
    blogUpdated += 1;
    const mod = d.modifiedIso ?? d.dateIso ?? "";
    bw.update(doc.ref, {
      contentHtml: nextContent,
      excerptHtml: nextExcerpt,
      ...(nextFeat !== undefined ? { featuredImageUrl: nextFeat } : {}),
      contentHash: contentHashHex(nextContent, mod),
    });
  }

  const podSnap = await db.collection(COLLECTIONS.podcastEpisodes).get();
  for (const doc of podSnap.docs) {
    const d = doc.data() as PodcastEpisodeDoc;
    const nextContent = rewriteWithPairs(d.contentHtml ?? "", pairs);
    const nextExcerpt = rewriteWithPairs(d.excerptHtml ?? "", pairs);
    const nextThumb = d.thumbnailUrl ? rewriteWithPairs(d.thumbnailUrl, pairs) : d.thumbnailUrl;
    const changed =
      nextContent !== (d.contentHtml ?? "") ||
      nextExcerpt !== (d.excerptHtml ?? "") ||
      nextThumb !== d.thumbnailUrl;
    if (!changed) continue;
    podUpdated += 1;
    const mod = d.modifiedIso ?? d.dateIso ?? "";
    bw.update(doc.ref, {
      contentHtml: nextContent,
      excerptHtml: nextExcerpt,
      ...(nextThumb !== undefined ? { thumbnailUrl: nextThumb } : {}),
      contentHash: contentHashHex(nextContent, mod),
    });
  }

  const guidesRef = db.collection(COLLECTIONS.resourcesGuides).doc(RESOURCES_GUIDES_DOC_ID);
  const guidesSnap = await guidesRef.get();
  if (guidesSnap.exists) {
    const raw = guidesSnap.data() as Record<string, unknown>;
    const next = rewriteResourcesGuidesUrls(raw, pairs);
    if (JSON.stringify(next) !== JSON.stringify(raw)) {
      guidesUpdated = 1;
      bw.update(guidesRef, next);
    }
  }

  const faqRef = db.collection(COLLECTIONS.resourcesFaq).doc(RESOURCES_FAQ_DOC_ID);
  const faqSnap = await faqRef.get();
  if (faqSnap.exists) {
    const raw = faqSnap.data() as Record<string, unknown>;
    const next = rewriteResourcesFaqUrls(raw, pairs);
    if (JSON.stringify(next) !== JSON.stringify(raw)) {
      faqUpdated = 1;
      bw.update(faqRef, next);
    }
  }

  await bw.close();
  console.log(
    `HTML rewrite: blog_posts=${blogUpdated}, podcast_episodes=${podUpdated}, guides=${guidesUpdated}, faq=${faqUpdated}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
