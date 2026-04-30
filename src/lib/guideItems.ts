/**
 * Canonical in-app paths for Resources guide items: /resources/guides/{type}/{slug}
 */

import { slugifyBlogTitle } from "@/lib/create-content/blog-slug";
import type { GuidesSection } from "@/lib/resourcesData";

/** URL segment for each guide item `type` label from CMS / static data */
const TYPE_TO_SEGMENT: Record<string, string> = {
  Guide: "guide",
  Article: "article",
  Video: "video",
  Graphic: "graphic",
  Whitepaper: "whitepaper",
};

export function guideTypeToSegment(typeLabel: string): string {
  const mapped = TYPE_TO_SEGMENT[typeLabel];
  if (mapped) return mapped;
  const fromLabel = slugifyBlogTitle(typeLabel);
  return fromLabel || "guide";
}

/** Remote URLs (http, storage, PDF, etc.) use the viewer; same-site paths stay as-is. */
export function guideItemUsesViewer(item: { url: string }): boolean {
  const u = item.url.trim();
  return u.startsWith("http://") || u.startsWith("https://");
}

/**
 * Deterministic slug per item, unique within `type` segment (matches iteration order in data).
 */
export function getGuideItemSlug(
  item: GuidesSection["items"][number],
  section: GuidesSection,
  guides: GuidesSection[]
): string {
  const targetSig = `${section.cat}\0${item.type}\0${item.label}\0${item.url}`;
  const targetSeg = guideTypeToSegment(item.type);

  const usedByTypeSeg = new Map<string, Set<string>>();

  for (const sec of guides) {
    for (const it of sec.items) {
      const seg = guideTypeToSegment(it.type);
      if (!usedByTypeSeg.has(seg)) usedByTypeSeg.set(seg, new Set());
      const used = usedByTypeSeg.get(seg)!;

      const base = slugifyBlogTitle(it.label) || "resource";
      let slug = base;
      let n = 1;
      while (used.has(slug)) {
        slug = `${base}-${n++}`;
      }
      used.add(slug);

      const sig = `${sec.cat}\0${it.type}\0${it.label}\0${it.url}`;
      if (sig === targetSig && seg === targetSeg) return slug;
    }
  }
  return slugifyBlogTitle(item.label) || "resource";
}

export function guideViewerPath(
  item: GuidesSection["items"][number],
  section: GuidesSection,
  guides: GuidesSection[]
): string {
  const typeSeg = guideTypeToSegment(item.type);
  const slug = getGuideItemSlug(item, section, guides);
  return `/resources/guides/${typeSeg}/${encodeURIComponent(slug)}`;
}

/** Link target for the guides list: internal paths unchanged; remote → viewer. */
export function resolveGuideItemHref(
  item: GuidesSection["items"][number],
  section: GuidesSection,
  guides: GuidesSection[]
): string {
  if (!guideItemUsesViewer(item)) {
    return item.url.trim();
  }
  return guideViewerPath(item, section, guides);
}

export type ResolvedGuideItem = {
  typeSegment: string;
  slug: string;
  section: GuidesSection;
  item: GuidesSection["items"][number];
};

export function findGuideByParams(
  typeSegment: string,
  slug: string,
  guides: GuidesSection[]
): ResolvedGuideItem | null {
  const decoded = decodeURIComponent(slug);
  for (const sec of guides) {
    for (const item of sec.items) {
      if (guideTypeToSegment(item.type) !== typeSegment) continue;
      if (getGuideItemSlug(item, sec, guides) === decoded) {
        return {
          typeSegment,
          slug: decoded,
          section: sec,
          item,
        };
      }
    }
  }
  return null;
}

export function listGuideViewerPaths(guides: GuidesSection[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const sec of guides) {
    for (const item of sec.items) {
      if (!guideItemUsesViewer(item)) continue;
      const typeSeg = guideTypeToSegment(item.type);
      const slug = getGuideItemSlug(item, sec, guides);
      const path = `/resources/guides/${typeSeg}/${slug}`;
      if (!seen.has(path)) {
        seen.add(path);
        out.push(path);
      }
    }
  }
  return out;
}
