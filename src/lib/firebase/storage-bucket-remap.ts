/**
 * Remap Firebase / GCS URLs from a migrated source bucket id to the destination bucket id.
 * Used after cross-project Storage copy when Firestore still references the old bucket name.
 */

import { rewriteFirebaseGatewayUrlToGcsPublic } from "./storage-public-url";

export function escapeRegexSegment(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replace `fromBucket` with `toBucket` in known Storage URL shapes only (no arbitrary substring replace). */
export function rewriteStorageBucketInString(
  input: string,
  fromBucket: string,
  toBucket: string
): string {
  if (!input || fromBucket === toBucket) return input;
  const esc = escapeRegexSegment(fromBucket);
  let out = input;

  // Firebase Storage JSON API: .../v0/b/{bucket}/o/{encodedPath}?...
  out = out.replace(
    new RegExp(
      `(https://firebasestorage\\.googleapis\\.com/v0/b/)(${esc})(/o/)`,
      "gi"
    ),
    `$1${toBucket}$3`
  );

  // Public object URL (often after rewriteFirebaseGatewayUrlToGcsPublic at read time)
  out = out.replace(
    new RegExp(`(https://storage\\.googleapis\\.com/)(${esc})(/)`, "gi"),
    `$1${toBucket}$3`
  );

  // gs:// URI (rare in HTML but possible in tooling / docs)
  out = out.replace(new RegExp(`(gs://)(${esc})(/)`, "gi"), `$1${toBucket}$3`);

  return out;
}

export interface BucketMapping {
  from: string;
  to: string;
}

/** Apply multiple bucket remaps; longer `from` strings run first to avoid partial overlaps. */
export function rewriteStorageBucketsInString(
  input: string,
  mappings: BucketMapping[]
): string {
  let out = input;
  const sorted = [...mappings].sort((a, b) => b.from.length - a.from.length);
  for (const { from, to } of sorted) {
    out = rewriteStorageBucketInString(out, from, to);
  }
  return out;
}

/** Default source buckets when migrating from studio → opolis production (override via env in scripts). */
export const DEFAULT_LEGACY_STORAGE_BUCKETS = [
  "studio-1015787882-4b057.firebasestorage.app",
  "studio-1015787882-4b057.appspot.com",
] as const;

/**
 * Runtime remap when Firestore/HTML still references a migrated Storage bucket id.
 *
 * Target bucket: `FIREBASE_STORAGE_BUCKET` or `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
 * (required for any rewrite).
 *
 * Legacy bucket ids: `STORAGE_URL_BUCKET_LEGACY_LIST` (comma-separated). If unset,
 * uses {@link DEFAULT_LEGACY_STORAGE_BUCKETS} (studio → production migration) so
 * production works without extra env after moving to `opolis-9cd29`.
 */
export function rewriteLegacyBucketsUsingEnv(html: string): string {
  const target =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!target) return html;

  const legacyRaw = process.env.STORAGE_URL_BUCKET_LEGACY_LIST?.trim();
  const fromBuckets = legacyRaw
    ? legacyRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [...DEFAULT_LEGACY_STORAGE_BUCKETS];

  if (fromBuckets.length === 0) return html;
  return rewriteStorageBucketsInString(
    html,
    fromBuckets.map((from) => ({ from, to: target }))
  );
}

/** Single-image URL fields (avatars, thumbnails): legacy bucket remap + public URL normalize (see storage-public-url). */
export function normalizeStoredFirebaseMediaUrl(
  s: string | undefined
): string | undefined {
  if (s == null || !String(s).trim()) return undefined;
  const t = rewriteLegacyBucketsUsingEnv(s.trim());
  const out = rewriteFirebaseGatewayUrlToGcsPublic(t);
  return out || undefined;
}
