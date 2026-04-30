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
} as const;

export const RESOURCES_GUIDES_DOC_ID = "data";
export const RESOURCES_FAQ_DOC_ID = "data";
