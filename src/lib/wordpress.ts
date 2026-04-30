/**
 * Blog posts: Firestore (default) or WordPress REST when CONTENT_SOURCE=wordpress.
 * Set WORDPRESS_URL for legacy WordPress mode.
 */

import type { BlogPost, FullBlogPost } from "@/lib/blogPosts";
import { BLOG_CATEGORY_FALLBACK_SLUG } from "@/lib/blogPosts";
import { getContentSource } from "@/lib/content-source";
import {
  DEFAULT_CATEGORY,
  getCategoryFromId,
} from "@/lib/wpCategoryMap";

const WORDPRESS_URL = process.env.WORDPRESS_URL || "";
const REVALIDATE_SECONDS = 60; // ISR: revalidate at most every 60 seconds

const FIELDS = "id,title,link,date,categories,slug";

/** WordPress REST API post shape (only fields we request) */
interface WPPost {
  id: number;
  title: { rendered: string };
  link: string;
  date: string;
  categories: number[];
  slug?: string;
}

/** Single post response with content and excerpt */
interface WPPostFull {
  id: number;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  date: string;
  modified?: string;
  link: string;
  categories: number[];
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&#?\w+;/g, (entity) => {
      const n = entity.startsWith("&#") ? entity.slice(2, -1) : entity.slice(1, -1);
      const code = n.startsWith("x") ? parseInt(n.slice(1), 16) : parseInt(n, 10);
      return isNaN(code) ? entity : String.fromCharCode(code);
    })
    .trim();
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate.slice(0, 10);
  }
}

function resolveWpCategorySlug(
  post: { categories: number[] },
  categoriesMap: Map<number, { name: string; slug: string }>
): string {
  const firstId = post.categories?.[0];
  if (firstId != null) {
    const cat = categoriesMap.get(firstId);
    if (cat?.slug) return cat.slug;
  }
  return BLOG_CATEGORY_FALLBACK_SLUG;
}

function mapWpPostToBlogPost(
  post: WPPost,
  categoriesMap: Map<number, { name: string; slug: string }>
): BlogPost {
  const firstCategoryId = post.categories?.[0];
  const { name: cat, color: cc } =
    firstCategoryId != null
      ? getCategoryFromId(firstCategoryId, categoriesMap)
      : DEFAULT_CATEGORY;
  return {
    cat,
    cc,
    date: formatDate(post.date),
    h: stripHtml(post.title?.rendered || ""),
    url: post.link || "",
    ...(post.slug && { slug: post.slug }),
    categorySlug: resolveWpCategorySlug(post, categoriesMap),
    dateIso: post.date,
  };
}

async function fetchCategories(
  baseUrl: string
): Promise<Map<number, { name: string; slug: string }>> {
  const url = `${baseUrl}/wp-json/wp/v2/categories?per_page=100&_fields=id,name,slug`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
    headers: {
      "Content-Type": "application/json",
      ...(process.env.WORDPRESS_API_TOKEN && {
        Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
      }),
    },
  });
  if (!res.ok) return new Map();
  const data = (await res.json()) as WPCategory[];
  const map = new Map<number, { name: string; slug: string }>();
  if (Array.isArray(data)) {
    for (const c of data) {
      map.set(c.id, { name: c.name || "", slug: c.slug || "" });
    }
  }
  return map;
}

/**
 * Fetches all blog posts from WordPress REST API.
 * Uses _fields to request only id, title, link, date, categories so responses stay under 2MB and are cacheable.
 * Returns empty array if WORDPRESS_URL is not set or request fails.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  if (getContentSource() === "firestore") {
    try {
      const { getBlogPostsFromFirestore } = await import("@/lib/firestore-content");
      return await getBlogPostsFromFirestore();
    } catch (err) {
      console.error("[Firestore] getBlogPosts:", err);
      return [];
    }
  }

  if (!WORDPRESS_URL) return [];

  const baseUrl = WORDPRESS_URL.replace(/\/$/, "");

  try {
    const categoriesMap = await fetchCategories(baseUrl);

    const url = `${baseUrl}/wp-json/wp/v2/posts?per_page=100&_fields=${FIELDS}`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WORDPRESS_API_TOKEN && {
          Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
        }),
      },
    });

    if (!res.ok) {
      console.error("[WordPress] Posts fetch failed:", res.status, res.statusText);
      return [];
    }

    const data = (await res.json()) as WPPost[];
    const posts = Array.isArray(data) ? data.map((p) => mapWpPostToBlogPost(p, categoriesMap)) : [];

    const total = res.headers.get("X-WP-Total");
    const totalNum = total ? parseInt(total, 10) : 0;
    if (totalNum > 100) {
      const pages = Math.ceil(totalNum / 100);
      for (let page = 2; page <= pages; page++) {
        const pageRes = await fetch(
          `${baseUrl}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=${FIELDS}`,
          {
            next: { revalidate: REVALIDATE_SECONDS },
            headers: {
              "Content-Type": "application/json",
              ...(process.env.WORDPRESS_API_TOKEN && {
                Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
              }),
            },
          }
        );
        if (!pageRes.ok) break;
        const pageData = (await pageRes.json()) as WPPost[];
        posts.push(...pageData.map((p) => mapWpPostToBlogPost(p, categoriesMap)));
      }
    }

    return posts;
  } catch (err) {
    console.error("[WordPress] Error fetching posts:", err);
    return [];
  }
}

const FULL_POST_FIELDS =
  "id,slug,title,content,excerpt,date,modified,link,categories";

/**
 * Fetches a single blog post by slug for the /blog/[slug] page.
 * Returns null if not found (call notFound() in page).
 */
export async function getBlogPostBySlug(
  slug: string
): Promise<FullBlogPost | null> {
  if (!slug) return null;

  if (getContentSource() === "firestore") {
    try {
      const { getBlogPostBySlugFromFirestore } = await import("@/lib/firestore-content");
      return await getBlogPostBySlugFromFirestore(slug);
    } catch (err) {
      console.error("[Firestore] getBlogPostBySlug:", err);
      return null;
    }
  }

  if (!WORDPRESS_URL) return null;

  const baseUrl = WORDPRESS_URL.replace(/\/$/, "");

  try {
    const categoriesMap = await fetchCategories(baseUrl);
    const url = `${baseUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=${FULL_POST_FIELDS}`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WORDPRESS_API_TOKEN && {
          Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
        }),
      },
    });

    if (!res.ok) return null;
    const data = (await res.json()) as WPPostFull | WPPostFull[];
    const raw = Array.isArray(data) ? data[0] : data;
    if (!raw?.slug) return null;

    const firstCategoryId = raw.categories?.[0];
    const { name: cat, color: cc } =
      firstCategoryId != null
        ? getCategoryFromId(firstCategoryId, categoriesMap)
        : DEFAULT_CATEGORY;

    const full: FullBlogPost = {
      slug: raw.slug,
      h: stripHtml(raw.title?.rendered || ""),
      cat,
      cc,
      date: formatDate(raw.date),
      url: raw.link || "",
      categorySlug: resolveWpCategorySlug(raw, categoriesMap),
      content: raw.content?.rendered ?? "",
      excerpt: raw.excerpt?.rendered ?? "",
      modified: raw.modified ? formatDate(raw.modified) : undefined,
      dateIso: raw.date,
      modifiedIso: raw.modified,
    };
    return full;
  } catch (err) {
    console.error("[WordPress] Error fetching post by slug:", err);
    return null;
  }
}
