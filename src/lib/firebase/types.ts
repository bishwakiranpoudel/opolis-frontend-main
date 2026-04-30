import type { PodcastSeriesKey } from "@/lib/podcastTypes";
import type { FaqSection, GuidesSection } from "@/lib/resourcesData";

export type BlogPostSource = "wordpress" | "cms";

/** Stored blog post (Firestore `blog_posts/{slug}`) */
export interface BlogPostDoc {
  /** WordPress post id when imported from WP; optional for CMS-authored posts */
  wpPostId?: number;
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
  source: BlogPostSource;
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
  source: "wordpress" | "static_fallback" | "cms";
}

export interface ResourcesFaqDoc {
  faq: FaqSection[];
  importedAt: string;
  source: "wordpress" | "static_fallback" | "cms";
}

/** Stored podcast episode (`podcast_episodes/{slug}`) — mirrors WP unemployable / OPR posts. */
export interface PodcastEpisodeDoc {
  wpPostId?: number;
  slug: string;
  title: string;
  excerptHtml: string;
  contentHtml: string;
  dateIso: string;
  modifiedIso?: string;
  legacyPermalink: string;
  /** Display grouping on /resources/podcasts */
  seasonLabel: string;
  /** Sort seasons on the listing (lower first): 1 = OPR, 2 = Unemployable */
  seasonOrder: number;
  /** Stable series id — set by import; omit on legacy docs (inferred from seasonOrder when reading). */
  seriesKey?: PodcastSeriesKey;
  /** Human-readable series title for Firestore console / denormalized reads. */
  seriesTitle?: string;
  wpCategoryIds: number[];
  youtubeVideoId?: string;
  thumbnailUrl?: string;
  thumbnailStoragePath?: string;
  wpContentHash?: string;
  contentHash?: string;
  /** Bump in import script when YouTube extraction or HTML rewrite rules change (triggers re-import). */
  podcastImporterVersion?: number;
  /** Unemployable S1 vs S2 (OPR uses “Season 1” only). */
  episodeSeasonLabel?: string;
  episodeSeasonSort?: number;
  importedAt: string;
  source: "wordpress" | "cms";
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
