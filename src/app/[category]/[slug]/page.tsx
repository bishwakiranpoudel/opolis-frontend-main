import { notFound, permanentRedirect } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/wordpress";
import { getLegacyTwoSegmentParamsFromUnresolved } from "@/lib/legacy-blog-paths";

type PageProps = { params: Promise<{ category: string; slug: string }> };

/**
 * Legacy WordPress URLs: `/some-category/post-slug` → 308 to `/blog/post-slug`.
 * One canonical article URL for SEO; sitemap lists only `/blog/{slug}`.
 */
export async function generateStaticParams() {
  return getLegacyTwoSegmentParamsFromUnresolved();
}

export default async function LegacyCategoryBlogRedirect({ params }: PageProps) {
  const { category, slug } = await params;
  if (!category || !slug) notFound();
  if (category.toLowerCase() === "blog") notFound();

  const post = await getBlogPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();

  permanentRedirect(`/blog/${encodeURIComponent(post.slug ?? slug)}`);
}
