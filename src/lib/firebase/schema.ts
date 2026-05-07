/** Firestore collection / document ids for WordPress migration content */

export const COLLECTIONS = {
  blogPosts: "blog_posts",
  blogCategories: "blog_categories",
  podcastEpisodes: "podcast_episodes",
  mediaMap: "media_map",
  resourcesGuides: "resources_guides",
  resourcesFaq: "resources_faq",
  importManifest: "import_manifest",
  urlMapPending: "url_map_pending",
  /** Board / team rows for /about (CRUD in CMS) */
  peopleEntries: "people_entries",
  /** Single-doc config: exempt salary floors by state */
  siteEligibility: "site_eligibility",
} as const;

export const RESOURCES_GUIDES_DOC_ID = "data";
export const RESOURCES_FAQ_DOC_ID = "data";
export const STATE_FLOORS_DOC_ID = "state_floors";
