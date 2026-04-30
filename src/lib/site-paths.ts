/**
 * Paths that appear in `src/app/sitemap.ts` (static routes + resources deep links + blog + podcasts + guide viewers).
 * Keep in sync when adding top-level pages.
 */

import { blogPostPath } from "@/lib/blogPosts";
import { listGuideViewerPaths } from "@/lib/guideItems";
import { podcastEpisodePath } from "@/lib/podcastTypes";
import { getBlogPosts } from "@/lib/wordpress";

/** Same list as sitemap `routes` (path segment after origin, "" = home). */
export const STATIC_SITEMAP_PATHS = [
  "",
  "/the-cooperative",
  "/eligibility",
  "/benefits",
  "/resources",
  "/resources/pricing",
  "/resources/compare",
  "/resources/guides",
  "/resources/faq",
  "/resources/blog",
  "/resources/podcasts",
  "/join",
  "/about",
  "/ai-reference",
  "/contact",
  "/bylaws",
  "/coalition-member",
  "/terms-of-service",
] as const;

/**
 * Canonical pathname for comparison: lowercase, leading slash, no trailing slash except "/".
 */
export function normalizeSitePathname(pathname: string): string {
  let p = pathname.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p.toLowerCase();
}

/**
 * Snapshot of every canonical path on the current site plus a slug → blog-post path
 * lookup so legacy URL shapes can be resolved to the new `/resources/blog/{cat}/{slug}`.
 */
export interface SitePathLookup {
  all: Set<string>;
  blogPathBySlug: Map<string, string>;
  podcastPathBySlug: Map<string, string>;
}

/**
 * Structural legacy paths → canonical targets (validated against `lookup.all` when applied).
 */
export const LEGACY_EXACT_PATH_ALIASES: Record<string, string> = {
  "/become-a-member": "/join",
  "/blog": "/resources/blog",
  "/podcast": "/resources/podcasts",
  "/resources/podcast": "/resources/podcasts",
  "/explore": "/resources",
  "/explore-benefits": "/benefits",
  "/explore/benefits": "/benefits",
  "/explore-opolis/benefits": "/benefits",
  "/explore/entity": "/eligibility",
  "/explore-opolis/entity": "/eligibility",
  "/explore/payroll": "/benefits",
  "/explore-opolis/payroll": "/benefits",
  "/explore/rewards": "/the-cooperative",
  "/explore-opolis/rewards": "/the-cooperative",
  "/explore/optimize-your-taxes": "/resources/compare",
  "/explore-opolis/optimize-your-taxes": "/resources/compare",
  "/create-your-llc": "/eligibility",
  "/insurance/bonds": "/resources/faq",
};

/** Legacy WP podcast URL prefixes (segment before episode slug). */
const PODCAST_LEGACY_FIRST_SEGMENTS = new Set([
  "opolis-public-radio",
  "unemployable",
  "podcast",
]);

/**
 * Build a `SitePathLookup` aligned with `src/app/sitemap.ts`: static routes, blog posts,
 * podcast episodes, and remote guide viewer paths.
 */
export async function getSitemapPathnameLookup(): Promise<SitePathLookup> {
  const all = new Set<string>();
  for (const p of STATIC_SITEMAP_PATHS) {
    const n = p === "" ? "/" : normalizeSitePathname(p);
    all.add(n);
  }
  const blogPathBySlug = new Map<string, string>();
  const posts = await getBlogPosts();
  for (const post of posts) {
    if (post.slug) {
      const canonical = normalizeSitePathname(blogPostPath(post));
      all.add(canonical);
      blogPathBySlug.set(post.slug.toLowerCase(), canonical);
    }
  }

  const podcastPathBySlug = new Map<string, string>();
  try {
    const [{ getPodcastEpisodes }, { getGuides }] = await Promise.all([
      import("@/lib/podcasts"),
      import("@/lib/wordpressResources"),
    ]);
    const [episodes, guides] = await Promise.all([
      getPodcastEpisodes(),
      getGuides(),
    ]);
    for (const ep of episodes) {
      if (!ep.slug) continue;
      const canonical = normalizeSitePathname(podcastEpisodePath(ep.slug));
      all.add(canonical);
      podcastPathBySlug.set(ep.slug.toLowerCase(), canonical);
    }
    for (const path of listGuideViewerPaths(guides)) {
      all.add(normalizeSitePathname(path));
    }
  } catch (err) {
    console.warn(
      "[site-paths] Podcast/guide paths omitted from lookup (Firestore/env):",
      err instanceof Error ? err.message : err
    );
  }

  return { all, blogPathBySlug, podcastPathBySlug };
}

/** Return normalized pathname if it exists on the site snapshot; otherwise null. */
export function normalizeAndValidateSitePath(
  path: string | null | undefined,
  lookup: SitePathLookup
): string | null {
  if (path == null || !String(path).trim()) return null;
  const n = normalizeSitePathname(path);
  return lookup.all.has(n) ? n : null;
}

/**
 * Back-compat shim: returns only the path Set.
 */
export async function getSitemapPathnameSet(): Promise<Set<string>> {
  const lookup = await getSitemapPathnameLookup();
  return lookup.all;
}

/** Hosts we treat as “this site” for URL mapping (matches opolis.co / subdomains). */
export function isOpolisSiteHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "opolis.co" || h === "www.opolis.co" || h.endsWith(".opolis.co");
}

/**
 * Single-segment routes that are NOT blog posts (avoid mapping `/join` → blog by mistake).
 * Must match what you ship as static pages.
 */
const SINGLE_SEGMENT_NON_BLOG = new Set(
  [
    "/",
    "/join",
    "/about",
    "/benefits",
    "/contact",
    "/eligibility",
    "/resources",
    "/bylaws",
    "/coalition-member",
    "/terms-of-service",
    "/ai-reference",
    "/the-cooperative",
    "/blog",
    "/podcast",
  ].map((p) => normalizeSitePathname(p))
);

/**
 * Map a legacy pathname to a path that exists on the current site, or null.
 * - Exact match on sitemap
 * - WordPress date archives: `/YYYY/MM/slug` or `/YYYY/MM/DD/slug` → canonical blog path if slug exists
 * - Category-style URLs: `/category/slug` → canonical blog path if that blog post exists
 * - Legacy `/blog/slug` → canonical `/resources/blog/{category}/{slug}` if that post exists
 * - Bare post permalink `/slug` (one segment) → canonical blog path if present (and not a known static page)
 */
export function resolvePathnameToSitemapPath(
  pathname: string,
  lookup: SitePathLookup
): string | null {
  const norm = normalizeSitePathname(pathname);
  if (lookup.all.has(norm)) return norm;

  const aliasTarget = LEGACY_EXACT_PATH_ALIASES[norm];
  if (aliasTarget) {
    const n = normalizeSitePathname(aliasTarget);
    if (lookup.all.has(n)) return n;
  }

  const parts = norm.split("/").filter(Boolean);

  if (
    parts.length >= 3 &&
    parts[0] === "resources" &&
    parts[1] === "blog"
  ) {
    const slug = parts[parts.length - 1];
    const canonical = slug ? lookup.blogPathBySlug.get(slug) : undefined;
    if (canonical) return canonical;
  }

  if (
    parts.length >= 3 &&
    /^\d{4}$/.test(parts[0]) &&
    /^\d{2}$/.test(parts[1])
  ) {
    const slug = parts[parts.length - 1];
    const canonical = slug ? lookup.blogPathBySlug.get(slug) : undefined;
    if (canonical) return canonical;
  }

  if (parts.length === 2) {
    if (PODCAST_LEGACY_FIRST_SEGMENTS.has(parts[0])) {
      const slug = parts[1];
      const pod = slug ? lookup.podcastPathBySlug.get(slug) : undefined;
      if (pod) return pod;
    }
    const slug = parts[1];
    const canonical = lookup.blogPathBySlug.get(slug);
    if (canonical) return canonical;
  }

  if (parts.length === 1 && !SINGLE_SEGMENT_NON_BLOG.has(norm)) {
    const slug = parts[0];
    const pod = lookup.podcastPathBySlug.get(slug);
    if (pod) return pod;
    const canonical = lookup.blogPathBySlug.get(slug);
    if (canonical) return canonical;
  }

  return null;
}
