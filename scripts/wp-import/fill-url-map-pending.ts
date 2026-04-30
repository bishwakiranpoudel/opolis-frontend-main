/**
 * Resolve `url_map_pending.oldUrl` paths to canonical on-site paths using the same
 * snapshot as `src/app/sitemap.ts` (static + blog + podcasts + guide viewers), plus
 * legacy aliases and slug rules in `src/lib/site-paths.ts`.
 *
 * - Re-validates existing `suggestedNewPath` against the current sitemap; invalid
 *   values are cleared and replaced when auto-resolution finds a target.
 * - Merges paths from `data/url-map-unresolved.json` so manual rows are rechecked.
 * - Writes `data/url-map-unresolved.json`: `{ oldPath, newPath }` for every tracked
 *   legacy pathname. Empty `newPath` means still unmappable. Non-empty rows are
 *   picked up by `next.config.ts` as redirects.
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
  getSitemapPathnameLookup,
  isOpolisSiteHostname,
  normalizeAndValidateSitePath,
  normalizeSitePathname,
  resolvePathnameToSitemapPath,
  type SitePathLookup,
} from "../../src/lib/site-paths";

const dryRun = process.argv.includes("--dry-run");

const UNRESOLVED_PATH = path.join(
  process.cwd(),
  "data",
  "url-map-unresolved.json"
);

function loadExistingManualPaths(): Map<string, string> {
  const out = new Map<string, string>();
  if (!fs.existsSync(UNRESOLVED_PATH)) return out;
  try {
    const parsed = JSON.parse(fs.readFileSync(UNRESOLVED_PATH, "utf8")) as {
      mappings?: { oldPath?: string; newPath?: string }[];
    };
    for (const m of parsed.mappings ?? []) {
      const oldP = m.oldPath?.trim();
      if (!oldP) continue;
      out.set(normalizeSitePathname(oldP), (m.newPath ?? "").trim());
    }
  } catch {
    /* ignore corrupt file */
  }
  return out;
}

function computeTargetForPath(
  normPath: string,
  validatedFirestoreSuggested: string | null,
  manualRaw: string | undefined,
  lookup: SitePathLookup
): string {
  if (validatedFirestoreSuggested) return validatedFirestoreSuggested;
  const auto = resolvePathnameToSitemapPath(normPath, lookup);
  if (auto) return auto;
  const manualOk = normalizeAndValidateSitePath(manualRaw ?? null, lookup);
  if (manualOk) return manualOk;
  return "";
}

async function main() {
  getFirebaseAdmin();
  const db = getFirestore();
  const lookup = await getSitemapPathnameLookup();
  const manualRawByPath = loadExistingManualPaths();

  const snap = await db.collection(COLLECTIONS.urlMapPending).get();
  const pathResults = new Map<string, string>();

  const byOldUrl = new Map<string, string[]>();
  const docById = new Map<string, UrlMapPendingDoc>();
  for (const doc of snap.docs) {
    const d = doc.data() as UrlMapPendingDoc;
    docById.set(doc.id, d);
    const u = d.oldUrl;
    if (!u) continue;
    if (!byOldUrl.has(u)) byOldUrl.set(u, []);
    byOldUrl.get(u)!.push(doc.id);
  }

  let updated = 0;
  const bw = !dryRun ? db.bulkWriter() : null;

  for (const [oldUrl, docIds] of byOldUrl) {
    let normPath: string;
    try {
      const parsed = new URL(oldUrl);
      if (!isOpolisSiteHostname(parsed.hostname)) continue;
      normPath = normalizeSitePathname(parsed.pathname);
    } catch {
      continue;
    }

    let validatedFs: string | null = null;
    for (const id of docIds) {
      const d = docById.get(id);
      const ok = normalizeAndValidateSitePath(
        d?.suggestedNewPath ?? null,
        lookup
      );
      if (ok) {
        validatedFs = ok;
        break;
      }
    }

    const manualEntry = manualRawByPath.get(normPath);
    const finalTarget = computeTargetForPath(
      normPath,
      validatedFs,
      manualEntry,
      lookup
    );

    pathResults.set(normPath, finalTarget);

    const suggestedNull = finalTarget || null;
    if (bw) {
      for (const id of docIds) {
        bw.update(db.collection(COLLECTIONS.urlMapPending).doc(id), {
          suggestedNewPath: suggestedNull,
        });
        updated += 1;
      }
    } else {
      updated += docIds.length;
    }
  }

  for (const [normPath, rawManual] of manualRawByPath) {
    if (pathResults.has(normPath)) continue;
    pathResults.set(
      normPath,
      computeTargetForPath(normPath, null, rawManual, lookup)
    );
  }

  if (bw) {
    await bw.close();
  }

  const mappings = [...pathResults.entries()]
    .map(([oldPath, newPath]) => ({ oldPath, newPath }))
    .sort((a, b) => a.oldPath.localeCompare(b.oldPath));

  if (!dryRun) {
    writeUnresolvedFile(mappings);
  } else {
    console.log(
      "[dry-run] Would write data/url-map-unresolved.json with",
      mappings.length,
      "rows"
    );
  }

  const filled = mappings.filter((m) => m.newPath).length;
  console.log(
    dryRun
      ? `[dry-run] ${byOldUrl.size} unique pending URLs, ${updated} doc updates (not applied)`
      : `Updated ${updated} url_map_pending rows (${byOldUrl.size} unique old URLs).`
  );
  console.log(
    `Legacy path catalog: ${mappings.length} rows (${filled} with redirects, ${mappings.length - filled} still open) → data/url-map-unresolved.json`
  );
}

function writeUnresolvedFile(
  mappings: { oldPath: string; newPath: string }[]
): void {
  const outDir = path.join(process.cwd(), "data");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    UNRESOLVED_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        description:
          "Legacy opolis.co pathnames: newPath is the canonical on-site target when known (Next redirects use non-empty newPath). Empty newPath still needs a decision.",
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
