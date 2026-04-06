/**
 * Match `url_map_pending.oldUrl` paths against the current site sitemap (static + blog).
 * - If pathname is on opolis.co and exists on the site: set suggestedNewPath to that path (canonical lowercase form).
 * - Otherwise leave suggestedNewPath null.
 * - Writes unique unresolved opolis paths to data/url-map-unresolved.json (oldPath → newPath "", no duplicate oldPath).
 *
 * Usage: npx tsx scripts/wp-import/fill-url-map-pending.ts [--dry-run]
 */

import "./config";
import fs from "node:fs";
import path from "node:path";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { UrlMapPendingDoc } from "../../src/lib/firebase/types";
import {
  getSitemapPathnameSet,
  isOpolisSiteHostname,
  normalizeSitePathname,
  resolvePathnameToSitemapPath,
} from "../../src/lib/site-paths";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  getFirebaseAdmin();
  const db = getFirestore();
  const pathSet = await getSitemapPathnameSet();

  const snap = await db.collection(COLLECTIONS.urlMapPending).get();
  if (snap.empty) {
    console.log("No url_map_pending documents.");
    writeUnresolvedFile([]);
    return;
  }

  /** Group by exact oldUrl string (multiple docs can share the same link from different posts). */
  const byOldUrl = new Map<string, string[]>();
  for (const doc of snap.docs) {
    const d = doc.data() as UrlMapPendingDoc;
    const u = d.oldUrl;
    if (!u) continue;
    if (!byOldUrl.has(u)) byOldUrl.set(u, []);
    byOldUrl.get(u)!.push(doc.id);
  }

  let updated = 0;
  const unresolvedPaths = new Map<string, { newPath: string }>();
  const bw = !dryRun ? db.bulkWriter() : null;

  for (const [oldUrl, docIds] of byOldUrl) {
    let suggested: string | null = null;

    try {
      const parsed = new URL(oldUrl);
      if (isOpolisSiteHostname(parsed.hostname)) {
        suggested = resolvePathnameToSitemapPath(parsed.pathname, pathSet);
      }
    } catch {
      suggested = null;
    }

    if (bw) {
      for (const id of docIds) {
        bw.update(db.collection(COLLECTIONS.urlMapPending).doc(id), {
          suggestedNewPath: suggested,
        });
        updated += 1;
      }
    } else {
      updated += docIds.length;
    }

    try {
      const parsed = new URL(oldUrl);
      if (!isOpolisSiteHostname(parsed.hostname)) continue;
      const normPath = normalizeSitePathname(parsed.pathname);
      if (suggested === null && !unresolvedPaths.has(normPath)) {
        unresolvedPaths.set(normPath, { newPath: "" });
      }
    } catch {
      /* skip malformed for export */
    }
  }

  if (bw) {
    await bw.close();
  }

  const mappings = [...unresolvedPaths.entries()].map(([oldPath, v]) => ({
    oldPath,
    newPath: v.newPath,
  }));
  mappings.sort((a, b) => a.oldPath.localeCompare(b.oldPath));

  if (!dryRun) {
    writeUnresolvedFile(mappings);
  } else {
    console.log("[dry-run] Would write data/url-map-unresolved.json with", mappings.length, "rows");
  }

  console.log(
    dryRun
      ? `[dry-run] ${byOldUrl.size} unique URLs, ${updated} document updates (not applied)`
      : `Updated ${updated} url_map_pending rows (${byOldUrl.size} unique old URLs).`
  );
  console.log(
    `Unresolved opolis paths (for manual fill): ${mappings.length} → data/url-map-unresolved.json`
  );
}

function writeUnresolvedFile(
  mappings: { oldPath: string; newPath: string }[]
): void {
  const outDir = path.join(process.cwd(), "data");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "url-map-unresolved.json");
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        description:
          "Opolis URLs whose path is not on the current sitemap; fill newPath for redirects / sheet import.",
        mappings,
      },
      null,
      2
    ),
    "utf8"
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
