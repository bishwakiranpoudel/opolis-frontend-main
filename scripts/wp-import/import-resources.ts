/**
 * Import Guides + FAQ into Firestore; mirror opolis.co/wp-content assets to Storage.
 * Usage: npx tsx scripts/wp-import/import-resources.ts [--force]
 */

import "./config";
import fs from "node:fs";
import path from "node:path";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS, RESOURCES_FAQ_DOC_ID, RESOURCES_GUIDES_DOC_ID } from "../../src/lib/firebase/schema";
import { FAQ_SECTIONS, GUIDES_DATA, isFaqSection, isGuidesSection } from "../../src/lib/resourcesData";
import {
  mirrorWpAssetToStorage,
  wpUploadsRelativePathFromUrl,
} from "./lib/media-map-write";
import { tryFetchCustomFaq, tryFetchCustomGuides } from "./wp-client";
import { FIREBASE_STORAGE_BUCKET, requireWordPressUrl } from "./config";

const force = process.argv.includes("--force");

function safeSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

function filenameFromUrl(u: string): string {
  try {
    const { pathname } = new URL(u);
    return safeSegment(path.basename(pathname) || "file");
  } catch {
    return "file";
  }
}

function shouldMirrorUpload(url: string): boolean {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("opolis.co")) return false;
    if (u.pathname.includes("/wp-content/")) return true;
    return /\.(pdf|png|jpe?g|gif|webp)$/i.test(u.pathname);
  } catch {
    return false;
  }
}

async function resolveGuides(): Promise<{
  guides: typeof GUIDES_DATA;
  source: "wordpress" | "static_fallback";
}> {
  const raw = await tryFetchCustomGuides();
  if (!raw) {
    return { guides: GUIDES_DATA, source: "static_fallback" };
  }
  const data = raw as Record<string, unknown> | unknown[];
  const list = Array.isArray(data)
    ? data
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { guides?: unknown }).guides)
      ? (data as { guides: unknown[] }).guides
      : null;
  if (!list || !Array.isArray(list)) {
    return { guides: GUIDES_DATA, source: "static_fallback" };
  }
  const valid = list.filter(isGuidesSection);
  if (valid.length === 0) {
    return { guides: GUIDES_DATA, source: "static_fallback" };
  }
  return { guides: valid, source: "wordpress" };
}

async function resolveFaq(): Promise<{
  faq: typeof FAQ_SECTIONS;
  source: "wordpress" | "static_fallback";
}> {
  const raw = await tryFetchCustomFaq();
  if (!raw) {
    return { faq: FAQ_SECTIONS, source: "static_fallback" };
  }
  const data = raw as Record<string, unknown> | unknown[];
  const list = Array.isArray(data)
    ? data
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { faq?: unknown }).faq)
      ? (data as { faq: unknown[] }).faq
      : null;
  if (!list || !Array.isArray(list)) {
    return { faq: FAQ_SECTIONS, source: "static_fallback" };
  }
  const valid = list.filter(isFaqSection);
  if (valid.length === 0) {
    return { faq: FAQ_SECTIONS, source: "static_fallback" };
  }
  return { faq: valid, source: "wordpress" };
}

async function main() {
  requireWordPressUrl();
  if (!FIREBASE_STORAGE_BUCKET) {
    throw new Error("Set FIREBASE_STORAGE_BUCKET");
  }

  getFirebaseAdmin();
  const db = getFirestore();
  const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);

  const { guides: guidesRaw, source: guidesSource } = await resolveGuides();
  const { faq: faqRaw, source: faqSource } = await resolveFaq();

  const guides = JSON.parse(JSON.stringify(guidesRaw)) as typeof GUIDES_DATA;
  let n = 0;
  const errors: string[] = [];

  for (const section of guides) {
    const catSlug = safeSegment(section.cat);
    for (const item of section.items) {
      if (!shouldMirrorUpload(item.url)) continue;
      n += 1;
      const fname = `${n}-${filenameFromUrl(item.url)}`;
      const dest = `resources/guides/${catSlug}/${fname}`;
      try {
        const r = await mirrorWpAssetToStorage({
          wpUrl: item.url,
          storagePath: dest,
          bucket,
          db,
          sourceKind: "resources_guide",
          extraFields: {
            resourcesGuideCategory: section.cat,
            wpUploadsRelativePath: wpUploadsRelativePathFromUrl(item.url),
          },
          options: { force },
        });
        item.url = r.publicUrl;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${item.label}: ${msg}`);
      }
    }
  }

  await db
    .collection(COLLECTIONS.resourcesGuides)
    .doc(RESOURCES_GUIDES_DOC_ID)
    .set({
      guides,
      importedAt: new Date().toISOString(),
      source: guidesSource,
      updatedAt: FieldValue.serverTimestamp(),
    });

  await db
    .collection(COLLECTIONS.resourcesFaq)
    .doc(RESOURCES_FAQ_DOC_ID)
    .set({
      faq: faqRaw,
      importedAt: new Date().toISOString(),
      source: faqSource,
      updatedAt: FieldValue.serverTimestamp(),
    });

  const runId = `resources-${Date.now()}`;
  await db
    .collection(COLLECTIONS.importManifest)
    .doc(runId)
    .set({
      runId,
      kind: "import-resources",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      wpTotals: { guideAssetsMirrored: n },
      ...(errors.length ? { errors } : {}),
    });

  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, "import-resources-last.json");
  fs.writeFileSync(
    logPath,
    JSON.stringify({ guidesSource, faqSource, errors, mirroredAssets: n }, null, 2),
    "utf8"
  );

  console.log(`Guides source: ${guidesSource}, FAQ source: ${faqSource}`);
  console.log(`Mirrored ${n} guide asset URLs. Log: ${logPath}`);
  if (errors.length) console.warn(errors);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
