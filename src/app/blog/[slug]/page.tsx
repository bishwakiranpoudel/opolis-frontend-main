import { notFound, permanentRedirect } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/wordpress";
import { blogPostPath } from "@/lib/blogPosts";
import type { BlogPost } from "@/lib/blogPosts";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Legacy canonical URL `/blog/{slug}` → 308 to new `/resources/blog/{category}/{slug}`.
 * Kept as a prerendered redirect so existing inbound links / index entries preserve SEO.
 */
export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts
    .filter((p): p is BlogPost & { slug: string } => !!p.slug)
    .map((p) => ({ slug: p.slug }));
}

export default async function LegacyBlogSlugRedirect({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(decodeURIComponent(slug));
  if (!post) notFound();
  permanentRedirect(blogPostPath(post));
}
