import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { buildMetadata, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { C } from "@/lib/constants";
import {
  getBlogPostBySlug,
  getBlogPosts,
} from "@/lib/wordpress";
import type { BlogPost } from "@/lib/blogPosts";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(str: string, max: number): string {
  const s = str.trim();
  if (s.length <= max) return s;
  return s.slice(0, max).trim().replace(/\s+\S*$/, "") + "…";
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts
    .filter((p): p is BlogPost & { slug: string } => !!p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  const description = truncate(stripHtml(post.excerpt), 155);
  return buildMetadata({
    title: `${post.h} | Opolis Blog`,
    description: description || "Read more on the Opolis blog.",
    path: `/blog/${slug}`,
    openGraph: { type: "article" },
  });
}

const RECENT_COUNT = 8;
const RELATED_COUNT = 5;

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getBlogPosts();
  const recent = allPosts.filter((p) => p.slug).slice(0, RECENT_COUNT);
  const related = allPosts
    .filter(
      (p): p is BlogPost & { slug: string } =>
        !!p.slug &&
        p.slug !== slug &&
        p.cat === post.cat
    )
    .slice(0, RELATED_COUNT);

  const articleLd = articleJsonLd({
    title: post.h,
    description: truncate(stripHtml(post.excerpt), 160),
    date: post.dateIso ?? post.date,
    modified: post.modifiedIso,
    slug: post.slug!,
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/resources" },
    { name: post.h, path: `/blog/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleLd),
        }}
      />
      <section className="sec-alt">
        <div className="wrap">
          <div className="blog-post-layout">
            <article className="blog-post-main">
              <span
                className="pill"
                style={{
                  display: "inline-block",
                  marginBottom: 16,
                  padding: "6px 14px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  borderRadius: 20,
                  background: post.cc,
                  color: "#000",
                }}
              >
                {post.cat}
              </span>
              <h1
                className="cond serif"
                style={{
                  fontSize: "clamp(28px,4vw,42px)",
                  fontWeight: 700,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: 12,
                }}
              >
                {post.h}
              </h1>
              <time
                dateTime={post.dateIso ?? post.date}
                style={{ fontSize: 14, color: C.gray, marginBottom: 32, display: "block" }}
              >
                {post.date}
              </time>
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>
            <aside className="blog-sidebar">
              <Link
                href="/resources"
                style={{
                  display: "inline-block",
                  marginBottom: 28,
                  fontSize: 14,
                  fontWeight: 600,
                  color: C.red,
                  textDecoration: "none",
                }}
              >
                ← Browse all articles
              </Link>
              <h3
                className="cond"
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 14,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Recent posts
              </h3>
              <ul className="blog-sidebar-list">
                {recent.map((p) => (
                  <li key={p.slug ?? p.url} className="blog-sidebar-item">
                    <Link
                      href={p.slug ? `/blog/${p.slug}` : p.url}
                      className="blog-sidebar-item__link"
                      {...(!p.slug && {
                        target: "_blank",
                        rel: "noopener noreferrer",
                      })}
                    >
                      <span className="blog-sidebar-item__title">{p.h}</span>
                      <span className="blog-sidebar-item__meta">{p.date}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {related.length > 0 && (
                <>
                  <h3
                    className="cond"
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Related
                  </h3>
                  <ul className="blog-sidebar-list" style={{ marginBottom: 0 }}>
                    {related.map((p) => (
                      <li key={p.slug} className="blog-sidebar-item">
                        <Link
                          href={`/blog/${p.slug}`}
                          className="blog-sidebar-item__link"
                        >
                          <span className="blog-sidebar-item__title">{p.h}</span>
                          <span className="blog-sidebar-item__meta">{p.date}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
