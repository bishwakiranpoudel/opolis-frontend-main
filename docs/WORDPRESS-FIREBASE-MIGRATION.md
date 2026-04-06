# WordPress → Firebase migration

This repo includes scripts to copy WordPress content into **Firestore** and **Cloud Storage**. The app **reads from Firestore by default**; set `CONTENT_SOURCE=wordpress` to use WordPress REST instead.

## Prerequisites

1. **WordPress** — `WORDPRESS_URL` (e.g. `https://opolis.co`). Use `WORDPRESS_API_TOKEN` if the REST API requires auth.
2. **Firebase** — service account JSON in `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS`, plus `FIREBASE_STORAGE_BUCKET` (same bucket as the Firebase console).
3. Copy `.env.example` to `.env.local` and fill secrets (never commit).

## Commands

| Script | Purpose |
|--------|---------|
| `npm run wp:discover` | Counts posts/media, checks `opolis/v1/guides` and `opolis/v1/faq`, compares with static `GUIDES_DATA` / `FAQ_SECTIONS`. Writes `logs/discovery-report.json`. |
| `npm run wp:import-posts` | Imports posts, mirrors inline + featured images to Storage, rewrites HTML, writes `blog_posts`, `media_map`, `url_map_pending`, `blog_categories`. |
| `npm run wp:import-resources` | Imports Guides + FAQ (from custom endpoints or static fallback), mirrors `opolis.co/wp-content` assets under `resources/guides/...`. |
| `npm run wp:import-media` | Full `wp/v2/media` library. Storage path mirrors `/wp-content/uploads/…` under `imports/wp-media/library/wp-{id}/…`. Use `--force` to re-upload and refresh labels after path/metadata changes. |
| `npm run wp:verify` | Compares WP vs Firestore counts; spot-checks `wp-content` references in posts. |
| `npm run wp:extract-links` | Lists unique `opolis.co` links from stored posts to `logs/extracted-opolis-links.json` for manual SEO mapping. |
| `npm run wp:fill-url-map` | Reads `url_map_pending`, sets `suggestedNewPath` when the path exists on the current sitemap (see `src/lib/site-paths.ts`), writes unique gaps to `data/url-map-unresolved.json`. Use `--dry-run` to preview counts without writing Firestore. |

Use `--force` on import commands to bypass idempotency skips.

**Large PDFs:** Default max download size is **200 MiB** (`WP_IMPORT_MAX_BYTES` in `.env.local`). `media_map` stores `contentSha256`, `sourceKind`, and WP labels for each file; dedupe key is `sha256(wpUrl)` (document id).

## Discovery vs static data

- **Blog** always comes from `wp/v2/posts` during import.
- **Guides / FAQ** — if `GET /wp-json/opolis/v1/guides` (and `/faq`) return valid JSON, those are used; otherwise the static data in `src/lib/resourcesData.ts` is used (same as the running app).

## Runtime: Firestore (default) vs WordPress

Ensure Firebase Admin credentials are available on the server (e.g. Vercel env or `FIREBASE_SERVICE_ACCOUNT_JSON`). Set all `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` for the browser SDK (`src/lib/firebase/web-config.ts`). To use WordPress REST for blog/resources again, set `CONTENT_SOURCE=wordpress`.

## SEO

1. **Redirects** — add entries to `data/url-redirect-map.json` (`mappings`: `from` full URL or path, `to` destination path). For legacy paths discovered by import, fill `newPath` in `data/url-map-unresolved.json`; entries with both `oldPath` and `newPath` are merged into Next.js redirects at build time.
2. **In-content links** — optional env `CONTENT_URL_REWRITE_MAP_JSON` (object of old → new strings) applied in `getBlogPostBySlugFromFirestore`.

## Firestore collections

See `src/lib/firebase/schema.ts` and `src/lib/firebase/types.ts` (`blog_posts`, `media_map`, `resources_guides`, `resources_faq`, etc.).
