import type { FaqSection, GuidesSection } from "@/lib/resourcesData";

/** Stored blog post (Firestore `blog_posts/{slug}`) */
export interface BlogPostDoc {
  wpPostId: number;
  slug: string;
  title: string;
  excerptHtml: string;
  contentHtml: string;
  dateIso: string;
  modifiedIso?: string;
  legacyPermalink: string;
  categoryIds: number[];
  /** Resolved display category (name + color) after WP mapping */
  cat: string;
  cc: string;
  featuredImageUrl?: string;
  featuredImageStoragePath?: string;
  /** Hash of raw WordPress HTML + modified for idempotent skips */
  wpContentHash?: string;
  contentHash?: string;
  importedAt: string;
  source: "wordpress";
}

export interface BlogCategoryDoc {
  wpId: number;
  name: string;
  slug: string;
}

/** Where this binary came from (for queries and human sorting). */
export type MediaSourceKind =
  | "wp_media_library"
  | "blog_inline"
  | "blog_featured"
  | "resources_guide";

export interface MediaMapDoc {
  wpUrl: string;
  storagePath: string;
  publicUrl: string;
  mimeType?: string;
  bytes?: number;
  importedAt: string;
  sourceKind?: MediaSourceKind;
  /** SHA-256 of file bytes (dedupe / integrity) */
  contentSha256?: string;
  /** WordPress media attachment id (library import) */
  wpMediaId?: number;
  wpMediaSlug?: string;
  wpMediaTitle?: string;
  /** Path after `/wp-content/uploads/` in the original URL */
  wpUploadsRelativePath?: string;
  /** Post slug when mirrored from article HTML or featured image */
  blogPostSlug?: string;
  /** Guides section category when mirrored from resources import */
  resourcesGuideCategory?: string;
}

export interface ResourcesGuidesDoc {
  guides: GuidesSection[];
  importedAt: string;
  source: "wordpress" | "static_fallback";
}

export interface ResourcesFaqDoc {
  faq: FaqSection[];
  importedAt: string;
  source: "wordpress" | "static_fallback";
}

export interface ImportManifestDoc {
  runId: string;
  kind: string;
  startedAt: string;
  finishedAt?: string;
  wpTotals?: Record<string, number>;
  written?: Record<string, number>;
  errors?: string[];
}

export interface UrlMapPendingDoc {
  oldUrl: string;
  foundInSlug: string;
  suggestedNewPath: string | null;
  discoveredAt: string;
}
