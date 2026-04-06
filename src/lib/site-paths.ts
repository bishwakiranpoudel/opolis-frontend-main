/**
 * Paths that appear in `src/app/sitemap.ts` (static routes + /resources/blog + /blog/[slug]).
 * Keep in sync when adding top-level pages.
 */

import { getBlogPosts } from "@/lib/wordpress";

/** Same list as sitemap `routes` (path segment after origin, "" = home). */
export const STATIC_SITEMAP_PATHS = [
  "",
  "/the-cooperative",
  "/eligibility",
  "/benefits",
  "/resources",
  "/resources/blog",
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
 * All pathnames that exist on the current site (static + blog posts from `getBlogPosts()`).
 */
export async function getSitemapPathnameSet(): Promise<Set<string>> {
  const set = new Set<string>();
  for (const p of STATIC_SITEMAP_PATHS) {
    const n = p === "" ? "/" : normalizeSitePathname(p);
    set.add(n);
  }
  const posts = await getBlogPosts();
  for (const post of posts) {
    if (post.slug) {
      set.add(normalizeSitePathname(`/blog/${post.slug}`));
    }
  }
  return set;
}

/** Hosts we treat as “this site” for URL mapping (matches opolis.co / subdomains). */
export function isOpolisSiteHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "opolis.co" || h === "www.opolis.co" || h.endsWith(".opolis.co");
}

/**
 * Single-segment routes that are NOT blog posts (avoid mapping `/join` → `/blog/join` by mistake).
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
  ].map((p) => normalizeSitePathname(p))
);

/**
 * Map a legacy pathname to a path that exists on the current site, or null.
 * - Exact match on sitemap
 * - WordPress date archives: `/YYYY/MM/slug` or `/YYYY/MM/DD/slug` → `/blog/slug` if present
 * - Category-style URLs: `/category/slug` → `/blog/slug` if that blog post exists (not for `/blog/slug`)
 * - Bare post permalink `/slug` (one segment) → `/blog/slug` if present (and not a known static page)
 */
export function resolvePathnameToSitemapPath(
  pathname: string,
  pathSet: Set<string>
): string | null {
  const norm = normalizeSitePathname(pathname);
  if (pathSet.has(norm)) return norm;

  const parts = norm.split("/").filter(Boolean);

  if (
    parts.length >= 3 &&
    /^\d{4}$/.test(parts[0]) &&
    /^\d{2}$/.test(parts[1])
  ) {
    const slug = parts[parts.length - 1];
    if (slug) {
      const blogPath = normalizeSitePathname(`/blog/${slug}`);
      if (pathSet.has(blogPath)) return blogPath;
    }
  }

  if (parts.length === 2 && parts[0] !== "blog") {
    const slug = parts[1];
    const blogPath = normalizeSitePathname(`/blog/${slug}`);
    if (pathSet.has(blogPath)) return blogPath;
  }

  if (parts.length === 1 && !SINGLE_SEGMENT_NON_BLOG.has(norm)) {
    const slug = parts[0];
    const blogPath = normalizeSitePathname(`/blog/${slug}`);
    if (pathSet.has(blogPath)) return blogPath;
  }

  return null;
}
