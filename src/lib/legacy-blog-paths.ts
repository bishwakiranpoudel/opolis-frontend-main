/**
 * Legacy WordPress URLs often used `/category-slug/post-slug` (two segments).
 * We resolve them to `/blog/{post-slug}` when that post exists — same content, one canonical URL.
 */

import fs from "node:fs";
import path from "node:path";

import { normalizeSitePathname } from "@/lib/site-paths";

export type LegacyCategorySlugParams = { category: string; slug: string };

/**
 * Reads `data/url-map-unresolved.json` and returns unique `{ category, slug }` pairs
 * for two-segment paths (excluding `/blog/...`, handled by `app/blog/[slug]`).
 */
export function getLegacyTwoSegmentParamsFromUnresolved(): LegacyCategorySlugParams[] {
  const filePath = path.join(process.cwd(), "data", "url-map-unresolved.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      mappings?: { oldPath?: string }[];
    };
    const seen = new Set<string>();
    const out: LegacyCategorySlugParams[] = [];
    for (const m of data.mappings ?? []) {
      const raw = m.oldPath?.trim();
      if (!raw) continue;
      const norm = normalizeSitePathname(raw);
      const parts = norm.split("/").filter(Boolean);
      if (parts.length !== 2) continue;
      if (parts[0] === "blog") continue;
      const key = `${parts[0]}/${parts[1]}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ category: parts[0], slug: parts[1] });
    }
    return out;
  } catch {
    return [];
  }
}
