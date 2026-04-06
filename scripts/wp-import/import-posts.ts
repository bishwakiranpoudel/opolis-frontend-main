/**
 * Import WordPress posts into Firestore + Storage (inline + featured images).
 * Usage: npx tsx scripts/wp-import/import-posts.ts [--force]
 */

import "./config";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { BlogPostDoc } from "../../src/lib/firebase/types";
import { getCategoryFromId } from "../../src/lib/wpCategoryMap";
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
  fetchAllPostsFull,
  fetchCategoriesMap,
  fetchMediaItem,
} from "./wp-client";
import {
  FIREBASE_STORAGE_BUCKET,
  requireWordPressUrl,
} from "./config";

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
    return safeSegment(base || "asset");
  } catch {
    return "asset";
  }
}

const force = process.argv.includes("--force");

async function main() {
  requireWordPressUrl();
  if (!FIREBASE_STORAGE_BUCKET) {
    throw new Error("Set FIREBASE_STORAGE_BUCKET");
  }

  getFirebaseAdmin();
  const db = getFirestore();
  const bucket = getStorage().bucket(FIREBASE_STORAGE_BUCKET);

  const base = requireWordPressUrl();
  const categoriesMap = await fetchCategoriesMap();
  const wpMap = new Map<number, { name: string; slug: string }>();
  for (const [id, c] of categoriesMap) {
    wpMap.set(id, { name: c.name, slug: c.slug });
  }

  const posts = await fetchAllPostsFull();
  const runId = `posts-${Date.now()}`;
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
        const snap = await db.collection(COLLECTIONS.blogPosts).doc(slug).get();
        if (snap.exists) {
          const prev = snap.data() as BlogPostDoc;
          if (prev.wpContentHash === wpContentHash) {
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
        const objectPath = `blog/${slug}/inline/${fname}`;
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

      const contentHtml = rewriteHtmlUrls(contentRaw, mapping);
      const excerptHtml = rewriteHtmlUrls(excerptRaw, mapping);

      let featuredImageUrl: string | undefined;
      let featuredImageStoragePath: string | undefined;
      if (post.featured_media) {
        const media = await fetchMediaItem(post.featured_media);
        if (media?.source_url) {
          const fName = `featured-${filenameFromUrl(media.source_url)}`;
          const objectPath = `blog/${slug}/${fName}`;
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
            featuredImageUrl = featured.publicUrl;
            featuredImageStoragePath = objectPath;
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${slug} featured: ${msg}`);
          }
        }
      }

      const firstCat = post.categories?.[0];
      const { name: cat, color: cc } =
        firstCat != null
          ? getCategoryFromId(firstCat, wpMap)
          : { name: "Blog", color: "#777" };

      const contentHash = createHash("sha256")
        .update(contentHtml + (post.modified || ""))
        .digest("hex");

      const doc: BlogPostDoc = {
        wpPostId: post.id,
        slug,
        title: post.title?.rendered?.replace(/<[^>]+>/g, "") ?? "",
        excerptHtml,
        contentHtml,
        dateIso: post.date,
        modifiedIso: post.modified,
        legacyPermalink: post.link,
        categoryIds: post.categories ?? [],
        cat,
        cc,
        featuredImageUrl,
        featuredImageStoragePath,
        wpContentHash,
        contentHash,
        importedAt: new Date().toISOString(),
        source: "wordpress",
      };

      await db.collection(COLLECTIONS.blogPosts).doc(slug).set(doc);
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

      log({ level: "ok", slug, wpId: post.id, assets: assetUrls.size });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${post.slug}: ${msg}`);
      log({ level: "error", slug: post.slug, err: msg });
    }
  }

  for (const [id, c] of categoriesMap) {
    await db
      .collection(COLLECTIONS.blogCategories)
      .doc(String(id))
      .set({
        wpId: id,
        name: c.name,
        slug: c.slug,
        updatedAt: FieldValue.serverTimestamp(),
      });
  }

  await db
    .collection(COLLECTIONS.importManifest)
    .doc(runId)
    .set({
      runId,
      kind: "import-posts",
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      wpTotals: { posts: posts.length },
      written: { blog_posts: written },
      ...(errors.length ? { errors } : {}),
    });

  console.log(`Imported ${written} posts. Log: ${logPath}`);
  if (errors.length) {
    console.warn(`${errors.length} errors (see manifest and log)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
