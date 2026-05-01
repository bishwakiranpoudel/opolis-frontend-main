import { getFirestore } from "firebase-admin/firestore";
import type { BlogPostDoc } from "@/lib/firebase/types";
import type { BlogCategoryMap } from "@/lib/firestore-content";
import { COLLECTIONS } from "@/lib/firebase/schema";
import { BLOG_CATEGORY_FALLBACK_SLUG, blogPostPath } from "@/lib/blogPosts";
import { SITE_URL } from "@/lib/constants";
import { getCategoryFromId } from "@/lib/wpCategoryMap";
import { isValidBlogSlug, slugifyBlogTitle } from "@/lib/create-content/blog-slug";

export type CreateBlogInput = {
  title: string;
  slug?: string;
  categoryWpId: number;
  excerptHtml: string;
  contentHtml: string;
  dateIso?: string;
  featuredImageUrl?: string;
};

function resolveCategorySlug(
  categoryIds: number[],
  categoriesMap: BlogCategoryMap
): string {
  const firstId = categoryIds[0];
  if (firstId != null) {
    const cat = categoriesMap.get(firstId);
    if (cat?.slug) return cat.slug;
  }
  return BLOG_CATEGORY_FALLBACK_SLUG;
}

export async function createBlogPostInFirestore(
  input: CreateBlogInput,
  categoriesMap: BlogCategoryMap
): Promise<{ slug: string; categorySlug: string; path: string }> {
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  const slug = (input.slug?.trim() || slugifyBlogTitle(title)).toLowerCase();
  if (!isValidBlogSlug(slug)) throw new Error("Invalid slug");
  if (!Number.isFinite(input.categoryWpId)) throw new Error("Category is required");
  if (!categoriesMap.has(input.categoryWpId)) {
    throw new Error("Unknown category id");
  }
  const excerptHtml = input.excerptHtml.trim();
  const contentHtml = input.contentHtml.trim();
  if (!excerptHtml) throw new Error("Excerpt is required");
  if (!contentHtml) throw new Error("Content is required");

  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.blogPosts).doc(slug);
  const existing = await ref.get();
  if (existing.exists) throw new Error("A post with this slug already exists");

  const { name: cat, color: cc } = getCategoryFromId(
    input.categoryWpId,
    categoriesMap
  );
  const categoryIds = [input.categoryWpId];
  const categorySlug = resolveCategorySlug(categoryIds, categoriesMap);
  const nowIso = new Date().toISOString();
  const dateIso =
    input.dateIso?.trim() ||
    nowIso.slice(0, 10) + "T12:00:00.000Z";

  const path = blogPostPath({ slug, categorySlug });
  const doc: BlogPostDoc = {
    slug,
    title,
    excerptHtml,
    contentHtml,
    dateIso,
    modifiedIso: nowIso,
    legacyPermalink: `${SITE_URL}${path}`,
    categoryIds,
    cat,
    cc,
    featuredImageUrl: input.featuredImageUrl?.trim() || undefined,
    importedAt: nowIso,
    source: "cms",
  };

  await ref.set(doc);
  return { slug, categorySlug, path };
}

export async function updateBlogPostInFirestore(
  slug: string,
  input: CreateBlogInput,
  categoriesMap: BlogCategoryMap
): Promise<{ slug: string; categorySlug: string; path: string }> {
  const key = slug.trim().toLowerCase();
  if (!key) throw new Error("Slug is required");
  const title = input.title.trim();
  if (!title) throw new Error("Title is required");
  if (!Number.isFinite(input.categoryWpId)) throw new Error("Category is required");
  if (!categoriesMap.has(input.categoryWpId)) {
    throw new Error("Unknown category id");
  }
  const excerptHtml = input.excerptHtml.trim();
  const contentHtml = input.contentHtml.trim();
  if (!excerptHtml) throw new Error("Excerpt is required");
  if (!contentHtml) throw new Error("Content is required");

  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.blogPosts).doc(key);
  const existingSnap = await ref.get();
  if (!existingSnap.exists) throw new Error("Post not found");

  const { name: cat, color: cc } = getCategoryFromId(
    input.categoryWpId,
    categoriesMap
  );
  const categoryIds = [input.categoryWpId];
  const categorySlug = resolveCategorySlug(categoryIds, categoriesMap);
  const nowIso = new Date().toISOString();
  const dateIso =
    input.dateIso?.trim() ||
    (existingSnap.data() as BlogPostDoc).dateIso ||
    nowIso.slice(0, 10) + "T12:00:00.000Z";

  const path = blogPostPath({ slug: key, categorySlug });
  const prev = existingSnap.data() as BlogPostDoc;
  const doc: BlogPostDoc = {
    ...prev,
    slug: key,
    title,
    excerptHtml,
    contentHtml,
    dateIso,
    modifiedIso: nowIso,
    legacyPermalink: `${SITE_URL}${path}`,
    categoryIds,
    cat,
    cc,
    featuredImageUrl: input.featuredImageUrl?.trim() || undefined,
    source: prev.source === "wordpress" ? prev.source : "cms",
  };

  await ref.set(doc);
  return { slug: key, categorySlug, path };
}

export async function deleteBlogPostFromFirestore(slug: string): Promise<void> {
  const key = slug.trim().toLowerCase();
  if (!key) throw new Error("Slug is required");
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.blogPosts).doc(key);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Post not found");
  await ref.delete();
}
