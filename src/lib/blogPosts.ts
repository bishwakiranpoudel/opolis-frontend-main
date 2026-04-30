/**
 * Blog posts for Resources page.
 * When WORDPRESS_URL is set, posts are fetched dynamically from WordPress (see lib/wordpress.ts).
 * ALL_POSTS is an empty fallback so the UI can show "0 articles" when WordPress is not configured or returns nothing.
 */

export interface BlogPost {
  cat: string;
  cc: string;
  date: string;
  h: string;
  url: string;
  /** Present when from WordPress; used for in-app /resources/blog/[category]/[slug] links */
  slug?: string;
  /** URL-safe primary category slug (e.g. "entity-creation"); fallback "blog" */
  categorySlug: string;
  /** ISO date from API for sitemap lastModified */
  dateIso?: string;
}

/** Full post for the single blog page (content, excerpt, etc.) */
export interface FullBlogPost extends BlogPost {
  content: string;
  excerpt: string;
  modified?: string;
  /** ISO date for JSON-LD datePublished */
  dateIso?: string;
  /** ISO date for JSON-LD dateModified */
  modifiedIso?: string;
  /** Hero / OG image when stored on the post document */
  featuredImageUrl?: string;
}

export const ALL_POSTS: BlogPost[] = [];

export const BLOG_CATEGORY_FALLBACK_SLUG = "blog";

/**
 * Canonical in-site path for a blog post.
 * `/resources/blog/{categorySlug}/{slug}`
 */
export function blogPostPath(
  post: Pick<BlogPost, "slug" | "categorySlug">
): string {
  const category = post.categorySlug || BLOG_CATEGORY_FALLBACK_SLUG;
  const slug = post.slug ?? "";
  return `/resources/blog/${category}/${slug}`;
}
