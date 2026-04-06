/**
 * Optional: import entire WordPress media library into Storage.
 * Paths: imports/wp-media/library/wp-{id}/... mirroring /wp-content/uploads/... when possible.
 * Dedupe: Firestore media_map doc id = sha256(source_url); skips if file exists in bucket.
 *
 * Usage: npx tsx scripts/wp-import/import-media.ts [--force] [--max-pages=50]
 */

import "./config";
import fs from "node:fs";
import path from "node:path";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import {
  fetchAllMediaPage,
  type WPMedia,
} from "./wp-client";
import {
  mirrorWpAssetToStorage,
  safePathSegment,
  wpUploadsRelativePathFromUrl,
} from "./lib/media-map-write";
import { FIREBASE_STORAGE_BUCKET, requireWordPressUrl } from "./config";

const force = process.argv.includes("--force");
const maxPagesArg = process.argv.find((a) => a.startsWith("--max-pages="));
const maxPages = maxPagesArg
  ? parseInt(maxPagesArg.split("=")[1] || "50", 10)
  : 500;

function libraryStoragePath(m: WPMedia): string {
  const url = m.source_url;
  const rel = wpUploadsRelativePathFromUrl(url);
  const prefix = `imports/wp-media/library/wp-${m.id}`;
  if (rel) {
    const parts = rel
      .split("/")
      .map((p) => safePathSegment(p))
      .filter(Boolean);
    return [prefix, ...parts].join("/");
  }
  try {
    const ext = path.extname(new URL(url).pathname) || "";
    const base = m.slug ? safePathSegment(m.slug) : "file";
    return `${prefix}/${base}${ext}`;
  } catch {
    return `${prefix}/file`;
  }
}

function mediaTitlePlain(m: WPMedia): string | undefined {
  const t = m.title?.rendered;
  if (!t) return undefined;
  return t.replace(/<[^>]*>/g, "").trim() || undefined;
}

async function main() {
  requireWordPressUrl();
  if (!FIREBASE_STORAGE_BUCKET) {
    throw new Error("Set FIREBASE_STORAGE_BUCKET");
  }

  getFirebaseAdmin();
  const db = getFirestore();
  const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);

  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `import-media-${Date.now()}.jsonl`);
  const log = (o: object) =>
    fs.appendFileSync(logPath, JSON.stringify(o) + "\n", "utf8");

  let page = 1;
  let total = 0;
  const errors: string[] = [];

  while (page <= maxPages) {
    const items = await fetchAllMediaPage(page);
    if (items.length === 0) break;

    for (const m of items) {
      if (!m.source_url) continue;
      const dest = libraryStoragePath(m);
      const rel = wpUploadsRelativePathFromUrl(m.source_url);
      try {
        const { action } = await mirrorWpAssetToStorage({
          wpUrl: m.source_url,
          storagePath: dest,
          bucket,
          db,
          sourceKind: "wp_media_library",
          extraFields: {
            wpMediaId: m.id,
            wpMediaSlug: m.slug,
            wpMediaTitle: mediaTitlePlain(m),
            wpUploadsRelativePath: rel,
          },
          options: { force },
        });
        if (action === "uploaded" || action === "repaired") total += 1;
        log({ level: action, id: m.id, dest });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${m.id}: ${msg}`);
        log({ level: "error", id: m.id, err: msg });
      }
    }

    if (items.length < 100) break;
    page += 1;
  }

  console.log(
    `Uploaded or repaired ${total} media files (see log for skipped/seen). Log: ${logPath}`
  );
  if (errors.length) console.warn(errors.slice(0, 30));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
