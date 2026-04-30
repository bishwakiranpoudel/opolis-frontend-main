import type { Metadata } from "next";
import { SITE_URL, LOGO_URL, SAME_AS_URLS, TWITTER_HANDLE } from "./constants";

export interface PageSEO {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  keywords?: string[];
  openGraph?: {
    type?: "website" | "article";
    image?: string;
    imageWidth?: number;
    imageHeight?: number;
  };
}

export function buildMetadata(seo: PageSEO): Metadata {
  const canonical = `${SITE_URL}${seo.path}`;
  const ogImage =
    seo.openGraph?.image ?? `${SITE_URL.replace(/\/$/, "")}/opengraph-image`;
  const ogWidth = seo.openGraph?.imageWidth ?? 1200;
  const ogHeight = seo.openGraph?.imageHeight ?? 630;

  return {
    title: seo.title,
    description: seo.description,
    ...(seo.keywords?.length && { keywords: seo.keywords }),
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical,
    },
    robots: seo.noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
    openGraph: {
      type: seo.openGraph?.type ?? "website",
      url: canonical,
      siteName: "Opolis",
      title: seo.title,
      description: seo.description,
      locale: "en_US",
      images: [{ url: ogImage, width: ogWidth, height: ogHeight, alt: seo.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      ...(TWITTER_HANDLE && {
        site: TWITTER_HANDLE,
        creator: TWITTER_HANDLE,
      }),
    },
    other: {
      "theme-color": "#0D0D0D",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Opolis",
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: LOGO_URL },
    description:
      "A member-owned employment cooperative providing W-2 employment infrastructure for independent professionals.",
    foundingDate: "2019",
    ...(SAME_AS_URLS.length > 0 ? { sameAs: SAME_AS_URLS } : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "Opolis",
    url: SITE_URL,
    description:
      "Independent work. Collective power. Employment infrastructure for independent professionals.",
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

function plainTextForSchema(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function faqJsonLd(faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: plainTextForSchema(item.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: plainTextForSchema(item.answer),
      },
    })),
  };
}

export interface ArticleJsonLdPost {
  title: string;
  description: string;
  date: string;
  modified?: string;
  path: string;
  image?: string | string[];
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface WebPageJsonLdProps {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}

export function webPageJsonLd(props: WebPageJsonLdProps) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: props.name,
    description: props.description,
    url: props.url,
    ...(props.datePublished && { datePublished: props.datePublished }),
    ...(props.dateModified && { dateModified: props.dateModified }),
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function articleJsonLd(post: ArticleJsonLdPost) {
  const image =
    post.image == null
      ? undefined
      : Array.isArray(post.image)
        ? post.image
        : [post.image];
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.modified && { dateModified: post.modified }),
    ...(image && image.length > 0 && { image }),
    author: {
      "@type": "Organization",
      name: "Opolis",
      url: SITE_URL,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${post.path}`,
    },
  };
}
