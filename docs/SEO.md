# Opolis — SEO Implementation & Strategy

**Client-ready reference** · Last updated: March 2025  
**Scope:** opolis-frontend (Next.js) — technical SEO, metadata, structured data, discoverability.

---

## Contents

1. [Overview](#1-overview)
2. [Goals](#2-goals)
3. [Technical implementation](#3-technical-implementation)
   - [Metadata (title, description, canonical)](#31-metadata-title-description-canonical)
   - [Robots directives](#32-robots-directives)
   - [Sitemap](#33-sitemap)
   - [Open Graph & Twitter Cards](#34-open-graph--twitter-cards)
   - [Structured data (JSON-LD)](#35-structured-data-json-ld)
   - [RSS feed (blog)](#36-rss-feed-blog)
   - [Semantic HTML](#37-semantic-html)
   - [Environment variables](#38-environment-variables)
4. [Page-by-page summary](#4-page-by-page-summary)
5. [Checklist](#5-checklist)
6. [Maintenance & extending](#6-maintenance--extending)
7. [References](#7-references)

---

## 1. Overview

This document describes **how** and **why** SEO is implemented across the Opolis marketing site. It is intended for:

- **Stakeholders & marketing** — what is in place and how it supports discoverability and sharing.
- **Developers** — where things live in the codebase and how to extend or change them.

It covers: techniques in use, file locations, extension points, and rationale.

---

## 2. Goals

| Goal | How we support it |
|------|--------------------|
| **Discoverability** | Unique titles and meta descriptions per page; canonical URLs; sitemap and robots.txt. |
| **Rich results** | Structured data (JSON-LD) for Organization, WebSite, Article, FAQ, BreadcrumbList, WebPage. |
| **Social sharing** | Open Graph and Twitter Card metadata with consistent branding. |
| **Crawlability** | Clean URLs, semantic HTML, sitemap.xml, sensible robots rules. |
| **Performance** | Next.js SSR/SSG, minimal client JS (supports Core Web Vitals and ranking signals). |

---

## 3. Technical implementation

### 3.1 Metadata (title, description, canonical)

**What**  
Every page has a unique `<title>`, `<meta name="description">`, and a canonical URL so search engines know the preferred URL and snippet text.

**Where**

- **Root:** `src/app/layout.tsx` — default metadata for the site.
- **Per-page:** Each route exports `metadata` (or `generateMetadata` for dynamic routes) and uses the shared helper `buildMetadata()` from `src/lib/seo.ts`.

**How**

- `buildMetadata(seo)` in `src/lib/seo.ts` builds Next.js `Metadata` with:
  - **title** — used for `<title>`, Open Graph, and Twitter.
  - **description** — used for meta description, OG, and Twitter.
  - **path** — used to build canonical URL: `{SITE_URL}{path}`.
  - Optional: `noIndex`, `keywords`, `openGraph` overrides (e.g. type `article`, custom image).

**Why**

- Unique titles and descriptions improve click-through and reduce duplicate-content issues.
- Canonical URLs consolidate signals to one preferred URL when the same content could be reached via query params or alternate paths.

**Example**

```ts
// src/app/about/page.tsx
export const metadata: Metadata = buildMetadata({
  title: "About Opolis — Member-Owned Employment Cooperative",
  description: "Opolis is a member-owned employment cooperative (LCA)...",
  path: "/about",
});
```

---

### 3.2 Robots directives

**What**  
We tell crawlers what they may index and where to find the sitemap.

**Where**  
`src/app/robots.ts` — Next.js App Router serves `/robots.txt`.

**How**

- **Default:** `allow: "/"`, `disallow: ["/api/"]`.
- **AI crawlers:** Explicit rules for `GPTBot`, `ChatGPT-User`, `Google-Extended`, `Anthropic-AI` — currently allow `/`, disallow `/api/`.
- **Sitemap:** `sitemap: {SITE_URL}/sitemap.xml`.

**Per-page no-index**  
If a page should not be indexed (e.g. thank-you or internal-only), pass `noIndex: true` to `buildMetadata()`. Implementation: `robots: { index: false, follow: true }` so links are still followed.

**Why**  
Clear crawl instructions reduce wasted crawl budget and ensure important pages are discovered; explicit AI crawler rules allow future tuning without changing default rules.

---

### 3.3 Sitemap

**What**  
An XML sitemap lists all public URLs with optional `lastmod`, `changefreq`, and `priority` to help crawlers discover and prioritize pages.

**Where**  
`src/app/sitemap.ts` — Next.js serves `/sitemap.xml`.

**How**

- **Static routes:** Home and main pages (`/`, `/the-cooperative`, `/eligibility`, `/benefits`, `/resources`, `/join`, `/about`, `/ai-reference`, `/contact`).
  - Home: `changeFrequency: "weekly"`, `priority: 1`.
  - Others: `changeFrequency: "monthly"`, `priority: 0.8`.
- **Blog posts:** Fetched from WordPress via `getBlogPosts()`; each post gets an entry `{SITE_URL}/blog/{slug}` with `lastModified` from post date, `changeFrequency: "monthly"`, `priority: 0.7`.

**Why**  
Speeds up discovery of new or updated pages; priority and change frequency give crawlers hints about how often to revisit.

---

### 3.4 Open Graph & Twitter Cards

**What**  
When links are shared on social platforms or messaging apps, OG and Twitter metadata control the preview (title, description, image).

**Where**

- Built by `buildMetadata()` in `src/lib/seo.ts`.
- Default OG image: `src/app/opengraph-image.tsx` (Next.js convention; dynamic image at `/opengraph-image`).

**How**

- **Open Graph:** `og:type` (default `website`, `article` for blog posts), `og:url`, `og:title`, `og:description`, `og:image` (default 1200×630), `og:site_name`, `og:locale`.
- **Twitter:** `twitter:card: summary_large_image`, `twitter:title`, `twitter:description`; optional `twitter:site` and `twitter:creator` from `NEXT_PUBLIC_SITE_TWITTER`.
- **Default OG image:** Rendered server-side in `opengraph-image.tsx` (brand text on dark background). Per-page override: pass `openGraph: { image, imageWidth, imageHeight }` to `buildMetadata()`.

**Why**  
Consistent, branded previews increase click-through and trust; article type and correct image dimensions improve how platforms render the preview.

---

### 3.5 Structured data (JSON-LD)

**What**  
Machine-readable schema (Schema.org) in JSON-LD format so search engines can show rich results (sitelinks, organization info, article snippets, FAQ accordions, breadcrumbs).

**Where**

- **Global (all pages):** `src/app/layout.tsx` injects Organization and WebSite.
- **Per-page:** Routes that need extra schema inject their own `<script type="application/ld+json">` (BreadcrumbList, Article, FAQPage, WebPage).
- Helpers: `src/lib/seo.ts`.

**Types in use**

| Type | Purpose | Where used |
|------|---------|------------|
| **Organization** | Brand identity, logo, sameAs links | Layout (global) |
| **WebSite** | Site name, URL, search action (link to /resources) | Layout (global) |
| **WebPage** | Page name, description, optional dates | Benefits, Eligibility, Resources |
| **Article** | Blog post headline, dates, author, publisher | Blog post pages (`/blog/[slug]`) |
| **FAQPage** | FAQ Q&A for rich FAQ results | Resources (FAQ tab data) |
| **BreadcrumbList** | Breadcrumb trail for SERP breadcrumbs | All main content pages |

**How**

- **Organization:** `organizationJsonLd()` — name, url, logo, description, foundingDate, sameAs.
- **WebSite:** `websiteJsonLd()` — name, url, publisher, `potentialAction` (SearchAction to /resources).
- **BreadcrumbList:** `breadcrumbJsonLd(items)` — list of `{ name, path }`.
- **Article:** `articleJsonLd(post)` — headline, description, datePublished, dateModified, image, author (Organization), publisher.
- **FAQPage:** `faqJsonLd(faq)` — array of `{ question, answer }`.
- **WebPage:** `webPageJsonLd({ name, description, url, datePublished?, dateModified? })` — linked to WebSite via `isPartOf`.

**Why**  
Rich results can improve visibility and click-through; Organization/WebSite support knowledge panels; Breadcrumbs and Article/FAQ schema align with how search engines use structured data.

---

### 3.6 RSS feed (blog)

**What**  
An RSS 2.0 feed for the blog so subscribers and aggregators can follow new posts.

**Important: where the blog lives in the UI**

- The **blog listing** is not a separate page. It is the **“Blog” tab on the Resources page** at **`/resources`**.
- Individual posts live at **`/blog/{slug}`**.
- The feed is at **`/blog/feed.xml`** and is the programmatic way to discover all blog posts.

**Where**

- **Feed route:** `src/app/blog/feed.xml/route.ts` — GET handler returns XML; URL is **`/blog/feed.xml`**.
- **Discovery:** `src/app/layout.tsx` includes `<link rel="alternate" type="application/rss+xml" title="Opolis Blog" href="{baseUrl}/blog/feed.xml">` so browsers and feed readers can discover the feed.

**How the feed is built**

- **Channel**
  - **Title:** “Opolis Blog”.
  - **Link:** `{SITE_URL}/resources` — this is correct: the blog is a tab on Resources, so the “home” of the blog in the UI is `/resources` (with the Blog tab). Feed readers and crawlers use this link as the feed’s main page.
  - **Description:** Short site + blog description.
  - **Language:** en-us.
  - **lastBuildDate:** Derived from the most recent post’s date when available; otherwise current time.
- **Items:** From `getBlogPosts()` (WordPress), filtered to posts with a `slug`, limited to 50. Each item: `title`, `link` = `{SITE_URL}/blog/{slug}`, `guid` (same link, `isPermaLink="true"`), `pubDate` (RFC 2822 from post date).
- **Self link:** `<atom:link rel="self" href="{baseUrl}/blog/feed.xml" type="application/rss+xml"/>` for feed discovery.

**Verification**

- Opening **`/blog/feed.xml`** returns valid RSS 2.0 with channel link **`/resources`** (blog listing).
- Each `<item><link>` points to **`/blog/{slug}`** (individual post).
- Layout’s alternate link points to **`/blog/feed.xml`**; channel link points to **`/resources`**. This matches the fact that the blog is a tab on `/resources`, not a standalone `/blog` index page.

**Why**  
RSS supports content distribution and can be used by search/news products; declaring the feed in the layout and using `/resources` as the channel link keeps the feed consistent with the site’s information architecture.

---

### 3.7 Semantic HTML

**What**  
Correct heading levels and landmarks so crawlers and assistive tech understand structure.

**How**

- One `<h1>` per page (e.g. hero title).
- Logical heading hierarchy (h1 → h2 → h3).
- Landmarks: `<main>`, `<nav>`, `<footer>`, `<article>`, `<aside>` where appropriate.
- Blog content in `<article>`; sidebar in `<aside>`.

**Why**  
Clear structure supports featured snippets and content understanding; accessibility and SEO overlap (e.g. descriptive links, alt text).

---

### 3.8 Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Base URL for canonicals, sitemap, OG, schema (e.g. `https://opolis.co`). |
| `NEXT_PUBLIC_LOGO_URL` | Absolute URL for Organization schema `logo`. |
| `NEXT_PUBLIC_SAME_AS` | Comma-separated social/profile URLs for Organization `sameAs`. |
| `NEXT_PUBLIC_SITE_TWITTER` | Twitter handle (e.g. `@opolis`) for `twitter:site` and `twitter:creator`. |

Set these in production so all absolute URLs and social links are correct.

---

## 4. Page-by-page summary

| Page | Title / description | Canonical | Structured data |
|------|----------------------|-----------|------------------|
| Home | Default from layout | `/` | Organization, WebSite, BreadcrumbList |
| The Cooperative | Custom | `/the-cooperative` | BreadcrumbList |
| Eligibility | Custom | `/eligibility` | BreadcrumbList, WebPage |
| Benefits | Custom | `/benefits` | BreadcrumbList, WebPage |
| Resources | Custom (includes Blog tab) | `/resources` | BreadcrumbList, WebPage, FAQPage (FAQ tab) |
| Join | Custom | `/join` | BreadcrumbList |
| About | Custom | `/about` | BreadcrumbList |
| AI Reference | Custom | `/ai-reference` | BreadcrumbList |
| Contact | Custom | `/contact` | BreadcrumbList |
| Blog post | `{title} \| Opolis Blog` + excerpt | `/blog/{slug}` | Article, BreadcrumbList |

---

## 5. Checklist

- [x] Unique title and meta description per page via `buildMetadata()`
- [x] Canonical URL per page via `metadataBase` and `alternates.canonical`
- [x] robots.txt with allow/disallow and sitemap reference
- [x] XML sitemap including static routes and blog posts
- [x] Open Graph (type, url, title, description, image, site_name, locale)
- [x] Twitter Cards (summary_large_image, title, description, optional site/creator)
- [x] Default OG image (Next.js opengraph-image)
- [x] Organization and WebSite JSON-LD (global)
- [x] BreadcrumbList JSON-LD on content pages
- [x] Article JSON-LD on blog post pages
- [x] FAQPage JSON-LD on Resources (FAQ content)
- [x] WebPage JSON-LD where relevant (Benefits, Eligibility, Resources)
- [x] RSS feed at `/blog/feed.xml` with channel link `/resources` (blog tab); alternate link in layout
- [x] Semantic HTML and single-h1 structure
- [x] Optional noIndex per page for non-indexed pages

---

## 6. Maintenance & extending

- **New static page:** Add route, call `buildMetadata({ title, description, path })`, add to sitemap `routes` in `sitemap.ts`, add BreadcrumbList (and WebPage if useful).
- **New blog content:** If using WordPress, new posts are included via `getBlogPosts()` in sitemap and feed; ensure slugs and dates are correct.
- **New FAQ or list content:** Use or extend `faqJsonLd()` / list-based schema and inject on the relevant page.
- **Change default OG image:** Edit `src/app/opengraph-image.tsx` or use a static image and set `openGraph.image` in default metadata.
- **Disallow a path:** Add the path to `disallow` in `src/app/robots.ts` (and optionally remove from sitemap).

---

## 7. References

- [Next.js Metadata](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central — Structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

*This document reflects the implementation in the opolis-frontend codebase as of the last update. For changes or questions, refer to the source files listed above.*
