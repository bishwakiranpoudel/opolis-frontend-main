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
  /** Present when from WordPress; used for in-app /blog/[slug] links */
  slug?: string;
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
}

export const ALL_POSTS: BlogPost[] = [];
