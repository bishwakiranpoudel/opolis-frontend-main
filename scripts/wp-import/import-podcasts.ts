/**
 * Import podcast episodes (WP categories Unemployable + Opolis Public Radio) into Firestore.
 * Usage: npx tsx scripts/wp-import/import-podcasts.ts [--force]
 */

import "./config";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { PodcastEpisodeDoc } from "../../src/lib/firebase/types";
import {
  SITE_URL,
  unemployableSeasonTwoStartIso,
  unemployableSeasonWpCategoryIds,
} from "../../src/lib/constants";
import {
  rewriteLegacyOpolisLinks,
} from "../../src/lib/podcastContent";
import { playlistYoutubeIdForPodcastSlug } from "../../src/lib/podcastYoutubeSlugMap";
import {
  enrichPodcastEpisodeSeasonFields,
  extractYoutubeVideoId,
  PODCAST_WP_CATEGORY_IDS,
  resolveSeriesBaseForSlug,
} from "../../src/lib/podcastTypes";
import {
  collectAssetUrls,
  extractOpolisLinks,
  rewriteHtmlUrls,
} from "./lib/html-assets";
import {
  mirrorWpAssetToStorage,
  wpUploadsRelativePathFromUrl,
} from "./lib/media-map-write";
import {
  fetchCategoriesMap,
  fetchMediaItem,
  fetchPostsForCategories,
} from "./wp-client";
import { FIREBASE_STORAGE_BUCKET, requireWordPressUrl } from "./config";

function hashUrl(u: string): string {
  return createHash("sha256").update(u).digest("hex");
}

function safeSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "file";
}

function filenameFromUrl(u: string): string {
  try {
    const { pathname } = new URL(u);
    const base = path.basename(pathname);
    return safeSegment(base || "file");
  } catch {
    return "file";
  }

}

function stripTitle(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

const force = process.argv.includes("--force");

/** Increment when excerpt/thumbnail YouTube extraction, series fields, or link rewrite rules change. */
const PODCAST_IMPORT_VERSION = 6;

async function main() {
  requireWordPressUrl();
  if (!FIREBASE_STORAGE_BUCKET) {
    throw new Error("Set FIREBASE_STORAGE_BUCKET");
  }

  getFirebaseAdmin();
  const db = getFirestore();
  const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);
  const base = requireWordPressUrl();

  const posts = await fetchPostsForCategories(PODCAST_WP_CATEGORY_IDS);
  const wpCategories = await fetchCategoriesMap();
  const seasonCats = unemployableSeasonWpCategoryIds();
  const runId = `podcasts-${Date.now()}`;
  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const logPath = path.join(logDir, `wp-import-${runId}.jsonl`);
  const log = (line: object) =>
    fs.appendFileSync(logPath, JSON.stringify(line) + "\n", "utf8");

  const urlSeen = new Map<string, string>();
  let written = 0;
  const errors: string[] = [];

  for (const post of posts) {
    const slug = post.slug || `wp-${post.id}`;
    try {
      const contentRaw = post.content?.rendered ?? "";
      const excerptRaw = post.excerpt?.rendered ?? "";
      const wpContentHash = createHash("sha256")
        .update(contentRaw + (post.modified || ""))
        .digest("hex");

      if (!force) {
        const snap = await db.collection(COLLECTIONS.podcastEpisodes).doc(slug).get();
        if (snap.exists) {
          const prev = snap.data() as PodcastEpisodeDoc;
          const importerOk =
            prev.podcastImporterVersion === PODCAST_IMPORT_VERSION;
          if (prev.wpContentHash === wpContentHash && importerOk) {
            log({ level: "skip", slug, reason: "unchanged" });
            continue;
          }
        }
      }

      const combined = contentRaw + excerptRaw;
      const assetUrls = collectAssetUrls(combined, base);
      const mapping = new Map<string, string>();
      let n = 0;
      for (const wpUrl of assetUrls) {
        n += 1;
        const fname = `${n}-${filenameFromUrl(wpUrl)}`;
        const objectPath = `podcasts/${slug}/inline/${fname}`;
        try {
          const { publicUrl } = await mirrorWpAssetToStorage({
            wpUrl,
            storagePath: objectPath,
            bucket,
            db,
            sourceKind: "blog_inline",
            extraFields: {
              blogPostSlug: slug,
              wpUploadsRelativePath: wpUploadsRelativePathFromUrl(wpUrl),
            },
            options: { force, urlSeen },
          });
          mapping.set(wpUrl, publicUrl);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          errors.push(`${slug} asset ${wpUrl}: ${msg}`);
          log({ level: "error", slug, wpUrl, err: msg });
        }
      }

      const contentHtml = rewriteLegacyOpolisLinks(
        rewriteHtmlUrls(contentRaw, mapping),
        SITE_URL
      );
      const excerptHtml = rewriteLegacyOpolisLinks(
        rewriteHtmlUrls(excerptRaw, mapping),
        SITE_URL
      );

      let thumbnailUrl: string | undefined;
      let thumbnailStoragePath: string | undefined;
      let featuredWpSourceUrl: string | undefined;
      if (post.featured_media) {
        const media = await fetchMediaItem(post.featured_media);
        if (media?.source_url) {
          featuredWpSourceUrl = media.source_url;
          const fName = `featured-${filenameFromUrl(media.source_url)}`;
          const objectPath = `podcasts/${slug}/${fName}`;
          try {
            const featured = await mirrorWpAssetToStorage({
              wpUrl: media.source_url,
              storagePath: objectPath,
              bucket,
              db,
              sourceKind: "blog_featured",
              extraFields: {
                blogPostSlug: slug,
                wpMediaId: media.id,
                wpMediaSlug: media.slug,
                wpMediaTitle: media.title?.rendered?.replace(/<[^>]+>/g, ""),
                wpUploadsRelativePath: wpUploadsRelativePathFromUrl(
                  media.source_url
                ),
              },
              options: { force, urlSeen },
            });
            thumbnailUrl = featured.publicUrl;
            thumbnailStoragePath = objectPath;
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${slug} featured: ${msg}`);
          }
        }
      }

      const cats = post.categories ?? [];
      const seriesBase = resolveSeriesBaseForSlug(slug, cats);
      const seasonFields = enrichPodcastEpisodeSeasonFields(
        slug,
        seriesBase,
        post.date,
        cats,
        wpCategories,
        {
          season2StartIso: unemployableSeasonTwoStartIso(),
          s1: seasonCats.s1,
          s2: seasonCats.s2,
        }
      );
      const {
        seasonOrder,
        seriesKey,
        seriesTitle,
      } = seriesBase;
      const { seasonLabel, episodeSeasonLabel, episodeSeasonSort } =
        seasonFields;

      const contentHash = createHash("sha256")
        .update(contentHtml + (post.modified || ""))
        .digest("hex");

      const ytMerged = [
        contentRaw,
        excerptRaw,
        featuredWpSourceUrl ?? "",
      ].join("\n");
      const ytId =
        playlistYoutubeIdForPodcastSlug(slug) ??
        extractYoutubeVideoId(ytMerged);
      const doc: PodcastEpisodeDoc = {
        wpPostId: post.id,
        slug,
        title: stripTitle(post.title?.rendered ?? ""),
        excerptHtml,
        contentHtml,
        dateIso: post.date,
        legacyPermalink: post.link,
        seasonLabel,
        seasonOrder,
        seriesKey,
        seriesTitle,
        episodeSeasonLabel,
        episodeSeasonSort,
        wpCategoryIds: cats,
        wpContentHash,
        contentHash,
        podcastImporterVersion: PODCAST_IMPORT_VERSION,
        importedAt: new Date().toISOString(),
        source: "wordpress",
        ...(post.modified ? { modifiedIso: post.modified } : {}),
        ...(ytId ? { youtubeVideoId: ytId } : {}),
        ...(thumbnailUrl
          ? { thumbnailUrl, thumbnailStoragePath }
          : {}),
      };

      await db.collection(COLLECTIONS.podcastEpisodes).doc(slug).set(doc);
      written += 1;

      const opolisLinks = [
        ...new Set([
          ...extractOpolisLinks(contentHtml, base),
          ...extractOpolisLinks(excerptHtml, base),
        ]),
      ];
      for (const oldUrl of opolisLinks) {
        await db
          .collection(COLLECTIONS.urlMapPending)
          .doc(hashUrl(`${slug}:${oldUrl}`))
          .set({
            oldUrl,
            foundInSlug: slug,
            suggestedNewPath: null,
            discoveredAt: new Date().toISOString(),
          });
      }

      log({ level: "ok", slug, wpId: post.id });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${post.slug}: ${msg}`);
      log({ level: "error", slug: post.slug, err: msg });
    }
  }

  await db
    .collection(COLLECTIONS.importManifest)
    .doc(runId)
    .set({
      runId,
      kind: "import-podcasts",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      wpTotals: { episodes: posts.length },
      written: { podcast_episodes: written },
      ...(errors.length ? { errors } : {}),
    });

  console.log(`Imported ${written} podcast episodes. Log: ${logPath}`);
  if (errors.length) {
    console.warn(`${errors.length} errors (see manifest and log)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
