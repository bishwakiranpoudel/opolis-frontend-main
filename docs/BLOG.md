# Opolis — Blog Implementation & Content Guide

**Client-ready documentation**  
**Last updated:** March 2025  
**Scope:** Blog data source, URLs, UI, SEO, and how to work with content.

---

## 1. Overview

The Opolis site surfaces **blog articles** in two ways:

1. **Resources page — Blog tab**  
   Lists and filters articles; links to individual posts.  
   **URL:** `/resources` (with “Blog” tab selected).

2. **Individual post pages**  
   Full article with sidebar (recent/related posts).  
   **URL:** `/blog/{slug}` (e.g. `/blog/your-post-slug`).

This document explains **how** the blog is built, **where** content comes from, **how** it’s displayed and SEO’d, and **how** to maintain or extend it.

---

## 2. Content Source: WordPress

**What:** Blog content is authored and stored in **WordPress**. The Next.js app does not store post content; it fetches it at build/request time via the **WordPress REST API**.

**Why:**  
- Content team can use the WordPress admin (editor, media, categories).  
- Single source of truth for posts; the frontend stays a “head” that displays and enhances that content (e.g. layout, SEO, performance).

**Configuration:**  
- **Env:** `WORDPRESS_URL` — base URL of the WordPress site (e.g. `https://opolis.co` or a separate subdomain).  
- Optional: `WORDPRESS_API_TOKEN` for authenticated requests if the API is restricted.

---

## 3. Data Flow

```
WordPress (CMS)
    ↓ REST API
getBlogPosts() / getBlogPostBySlug(slug)
    ↓
Next.js (ISR / server components)
    ↓
Resources “Blog” tab + /blog/[slug] page
```

- **List of posts:** `getBlogPosts()` in `src/lib/wordpress.ts` — used by Resources page, sitemap, and RSS feed.  
- **Single post:** `getBlogPostBySlug(slug)` — used by `/blog/[slug]` to render the full article.  
- **Caching:** Responses are cached with **ISR** (revalidate every 60 seconds by default). So new or updated posts appear within about a minute without a full rebuild.

---

## 4. Key Files & Responsibilities

| File | Responsibility |
|------|-----------------|
| `src/lib/wordpress.ts` | WordPress API client: fetch posts, single post by slug, categories; map to app’s `BlogPost` / `FullBlogPost` shape. |
| `src/lib/blogPosts.ts` | TypeScript types (`BlogPost`, `FullBlogPost`) and fallback `ALL_POSTS` (empty when using WordPress). |
| `src/app/resources/page.tsx` | Resources page; passes `initialPosts` from `getBlogPosts()` to client component. |
| `src/app/resources/ResourcesContent.tsx` | Resources UI including “Blog” tab: filters, search, list, links to `/blog/{slug}` or external `url`. |
| `src/app/blog/[slug]/page.tsx` | Dynamic post page: fetches post by slug, 404 if missing; renders article + sidebar; sets metadata and Article + Breadcrumb JSON-LD. |
| `src/app/blog/feed.xml/route.ts` | RSS 2.0 feed for blog; uses `getBlogPosts()` and outputs XML at `/blog/feed.xml`. |
| `src/app/sitemap.ts` | Includes blog post URLs from `getBlogPosts()` in the sitemap. |
| `src/app/globals.css` | Styles for `.blog-content`, `.blog-post-layout`, `.blog-sidebar`. |

---

## 5. Blog Data Shape

**List item (`BlogPost`):**  
- `h` — title (plain text)  
- `cat` — category display name  
- `cc` — category color (hex) for pill UI  
- `date` — formatted date string  
- `url` — original WordPress link (used when no `slug`)  
- `slug` — URL slug; when present, links go to `/blog/{slug}`  
- `dateIso` — ISO date for sitemap/feed/structured data  

**Full post (`FullBlogPost`) extends that with:**  
- `content` — HTML body  
- `excerpt` — HTML excerpt (used for meta description, stripped to plain text)  
- `modified` / `modifiedIso` — last modified date  

Categories are mapped from WordPress category IDs to display names and colors in `wordpress.ts` (e.g. Entity Creation, Benefits, Taxes, Payroll, Rewards).

---

## 6. URLs & Routing

- **Blog index / listing:**  
  - No dedicated `/blog` page. The **blog listing lives under Resources**: `/resources` with the “Blog” tab.  
  - Rationale: “Blog” is presented as one resource type among Pricing, Comparisons, Guides, FAQ.

- **Single post:**  
  - Route: `/blog/[slug]`.  
  - Example: slug `how-to-set-up-s-corp` → `https://opolis.co/blog/how-to-set-up-s-corp`.  
  - `generateStaticParams` pre-renders paths for all posts that have a `slug` (from WordPress).

- **RSS:**  
  - `/blog/feed.xml` — linked from layout as `rel="alternate" type="application/rss+xml"`.

---

## 7. How the Blog Tab Works (Resources)

- **Data:** Resources page is a server component that calls `getBlogPosts()` and passes the result as `initialPosts` to `ResourcesContent`.  
- **UI:** “Blog” tab shows:  
  - Category filter (All + category names from posts).  
  - Optional search (client-side filter by title).  
  - List of posts: title (link), category pill, date. Links use `slug` when present (`/blog/{slug}`), otherwise `url` (external).  
- **Fallback:** If WordPress is not configured or returns no posts, `ALL_POSTS` is empty and the UI shows an empty list (e.g. “0 articles”).

---

## 8. How a Single Post Page Works

- **Route:** `src/app/blog/[slug]/page.tsx`.  
- **Resolve post:** `getBlogPostBySlug(slug)`; if null, `notFound()`.  
- **Metadata:** `generateMetadata` builds title `{post title} | Opolis Blog`, description from stripped excerpt (truncated ~155 chars), canonical `/blog/{slug}`, Open Graph type `article`.  
- **Structured data:** Article JSON-LD (headline, description, dates, author/publisher) and BreadcrumbList (Home → Blog/Resources → Post title).  
- **Layout:** Two-column: main column = category pill, title, date, and HTML content (`.blog-content`); sidebar = “Browse all articles” link, “Recent posts”, “Related” (same category).  
- **Content styling:** `.blog-content` in `globals.css` styles headings, paragraphs, lists, blockquotes, links, code, images so WordPress HTML looks consistent and readable.

---

## 9. SEO for the Blog

- **Per-post:** Unique title and meta description; canonical `/blog/{slug}`; Article JSON-LD; BreadcrumbList.  
- **Discovery:** Post URLs are in the sitemap with `lastModified` from post date; RSS feed lists recent posts.  
- **Linking:** Layout links to RSS at `/blog/feed.xml`; breadcrumb “Blog” points to `/resources` (blog listing).  

Details are in **docs/SEO.md**.

---

## 10. Categories & Styling

Categories come from WordPress. The app maps category slug/name to:

- **Display name** (e.g. “Entity Creation”, “Benefits”, “Taxes”, “Payroll”, “Rewards”).  
- **Color** (hex) for the category pill on the post and in the Blog tab.

Mapping is in `wordpress.ts` (`CATEGORY_MAP`). Adding a new category in WordPress may require adding an entry there so it gets a name and color; otherwise it falls back to “Blog” and a default color.

---

## 11. Fallback When WordPress Is Unused

If `WORDPRESS_URL` is not set or the API fails:

- `getBlogPosts()` returns `[]`.  
- `getBlogPostBySlug(slug)` returns `null` (so `/blog/[slug]` 404s).  
- Resources Blog tab shows zero posts.  
- Sitemap and RSS still run but contain no blog entries.  
- Types and `ALL_POSTS` in `blogPosts.ts` allow the UI to render without errors.

This supports local or preview builds without a WordPress instance.

---

## 12. Adding or Changing Content

- **New post:** Create and publish in WordPress with the desired slug. It will appear in the Blog tab and at `/blog/{slug}` after the next revalidation (or immediately on next request in dev).  
- **Edit post:** Update in WordPress; changes appear within the ISR window (e.g. 60 seconds).  
- **New category:** Add to WordPress; optionally add mapping in `wordpress.ts` for display name and pill color.  
- **RSS / sitemap:** No extra step; both use `getBlogPosts()` and include all posts with a `slug`.

---

## 13. Summary

| Topic | Summary |
|-------|---------|
| **Content source** | WordPress, via REST API. |
| **List of posts** | `getBlogPosts()` → Resources “Blog” tab, sitemap, feed. |
| **Single post** | `getBlogPostBySlug(slug)` → `/blog/[slug]` page. |
| **URLs** | Listing: `/resources` (Blog tab). Post: `/blog/{slug}`. Feed: `/blog/feed.xml`. |
| **Caching** | ISR (e.g. 60s revalidate). |
| **SEO** | Per-post metadata, canonical, Article + Breadcrumb JSON-LD; sitemap and RSS. |
| **Categories** | From WordPress; name/color mapping in `wordpress.ts`. |

For technical SEO details (metadata, structured data, sitemap, robots), see **docs/SEO.md**.

---

## 14. Other resources from WordPress (Guides & FAQ)

The same “list from WordPress, redirect or internal links” pattern is used for the **Guides** and **FAQ** tabs on the Resources page. If optional WordPress REST endpoints are implemented, the app fetches those lists from WordPress and uses them instead of static data. See **docs/RESOURCES-WORDPRESS.md** for endpoint URLs, expected JSON shape, and how to implement them in WordPress.
