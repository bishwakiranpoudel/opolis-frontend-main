import { getBlogPosts } from "@/lib/wordpress";
import { SITE_URL } from "@/lib/constants";
import { blogPostPath } from "@/lib/blogPosts";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc2822(isoDate: string | undefined): string {
  if (!isoDate) return new Date().toUTCString();
  try {
    return new Date(isoDate).toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

export async function GET() {
  const posts = await getBlogPosts();
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const feedUrl = `${baseUrl}/blog/feed.xml`;

  const items = posts
    .filter((p) => p.slug)
    .slice(0, 50)
    .map((p) => {
      const link = `${baseUrl}${blogPostPath(p)}`;
      const pubDate = toRfc2822(p.dateIso);
      const title = escapeXml(p.h);
      return `  <item>
    <title>${title}</title>
    <link>${escapeXml(link)}</link>
    <guid isPermaLink="true">${escapeXml(link)}</guid>
    <pubDate>${pubDate}</pubDate>
  </item>`;
    })
    .join("\n");

  const lastBuild =
    posts.length > 0 && posts[0].dateIso
      ? toRfc2822(posts[0].dateIso)
      : new Date().toUTCString();

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Opolis Blog</title>
    <link>${escapeXml(baseUrl)}/resources/blog</link>
    <description>Opolis Blog — Articles and updates from the Resources section. Employment infrastructure for independent professionals. Member-owned cooperative: W-2 payroll, benefits, and compliance.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
