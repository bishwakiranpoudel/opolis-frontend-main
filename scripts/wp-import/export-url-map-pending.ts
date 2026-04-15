/**
 * Export Firestore `url_map_pending` to JSON: unique `oldUrl` → `newPath`
 * (`suggestedNewPath`). Multiple documents per old URL are merged; conflicts
 * between different suggested paths are listed.
 *
 * Usage:
 *   npx tsx scripts/wp-import/export-url-map-pending.ts
 *   npx tsx scripts/wp-import/export-url-map-pending.ts --out data/my-map.json
 *
 * Requires Firebase Admin (same as other wp-import scripts): `.env.local` with
 * `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`.
 */

import "./config";
import fs from "node:fs";
import path from "node:path";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { UrlMapPendingDoc } from "../../src/lib/firebase/types";

function parseOutPath(): string {
  const idx = process.argv.indexOf("--out");
  if (idx !== -1 && process.argv[idx + 1]) {
    return path.resolve(process.cwd(), process.argv[idx + 1]!);
  }
  return path.join(process.cwd(), "data", "url-map-pending-export.json");
}

type RowAgg = {
  docIds: string[];
  suggestions: (string | null)[];
  foundInSlugs: string[];
};

async function run(): Promise<void> {
  getFirebaseAdmin();
  const db = getFirestore();
  const outPath = parseOutPath();

  const snap = await db.collection(COLLECTIONS.urlMapPending).get();

  if (snap.empty) {
    const empty = {
      generatedAt: new Date().toISOString(),
      collection: COLLECTIONS.urlMapPending,
      totalDocuments: 0,
      uniqueOldUrls: 0,
      mappings: [] as {
        oldUrl: string;
        newPath: string | null;
        firestoreDocIds: string[];
        foundInSlugs: string[];
      }[],
      newPathConflicts: [] as {
        oldUrl: string;
        distinctNewPaths: string[];
        firestoreDocIds: string[];
      }[],
    };
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(empty, null, 2), "utf8");
    console.log(`Wrote ${outPath} (empty collection).`);
    return;
  }

  const byOld = new Map<string, RowAgg>();
  let documentsWithoutOldUrl = 0;

  for (const doc of snap.docs) {
    const d = doc.data() as UrlMapPendingDoc;
    const oldUrl = d.oldUrl?.trim();
    if (!oldUrl) {
      documentsWithoutOldUrl += 1;
      continue;
    }

    let agg = byOld.get(oldUrl);
    if (!agg) {
      agg = { docIds: [], suggestions: [], foundInSlugs: [] };
      byOld.set(oldUrl, agg);
    }
    agg.docIds.push(doc.id);
    agg.suggestions.push(d.suggestedNewPath ?? null);
    if (d.foundInSlug) agg.foundInSlugs.push(d.foundInSlug);
  }

  const newPathConflicts: {
    oldUrl: string;
    distinctNewPaths: string[];
    firestoreDocIds: string[];
  }[] = [];

  const mappings = [...byOld.entries()].map(([oldUrl, agg]) => {
    const nonNull = agg.suggestions.filter(
      (p): p is string => p != null && p !== ""
    );
    const distinct = [...new Set(nonNull)].sort((a, b) =>
      a.localeCompare(b)
    );

    let newPath: string | null = null;
    if (distinct.length === 1) {
      newPath = distinct[0]!;
    } else if (distinct.length > 1) {
      newPathConflicts.push({
        oldUrl,
        distinctNewPaths: distinct,
        firestoreDocIds: agg.docIds,
      });
      newPath = distinct[0]!;
    }

    const uniqueSlugs = [...new Set(agg.foundInSlugs)].sort();

    return {
      oldUrl,
      newPath,
      firestoreDocIds: agg.docIds,
      foundInSlugs: uniqueSlugs,
    };
  });

  mappings.sort((a, b) => a.oldUrl.localeCompare(b.oldUrl));

  const documentsWithOldUrl = snap.size - documentsWithoutOldUrl;
  const duplicateOldUrlDocuments = documentsWithOldUrl - mappings.length;

  const payload = {
    generatedAt: new Date().toISOString(),
    collection: COLLECTIONS.urlMapPending,
    totalDocuments: snap.size,
    documentsWithoutOldUrl,
    uniqueOldUrls: mappings.length,
    duplicateOldUrlDocuments,
    mappings,
    ...(newPathConflicts.length
      ? {
          newPathConflicts,
          note:
            "Same oldUrl had different non-null suggestedNewPath values; newPath uses lexicographically first path — resolve conflicts in Firestore or manually.",
        }
      : {}),
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");

  console.log(
    `Exported ${snap.size} document(s) → ${mappings.length} unique oldUrl(s) → ${outPath}`
  );
  if (newPathConflicts.length) {
    console.warn(
      `Warning: ${newPathConflicts.length} oldUrl(s) had conflicting suggestedNewPath; see newPathConflicts in the file.`
    );
  }
}

void run().catch((e) => {
  console.error(e);
  process.exit(1);
});
