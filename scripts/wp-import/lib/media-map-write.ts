import { createHash } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "../../../src/lib/firebase/schema";
import type { MediaMapDoc, MediaSourceKind } from "../../../src/lib/firebase/types";
import { downloadBinary, uploadBufferWithMetadata } from "./storage-upload";

/** Minimal bucket shape for existence checks + uploads (Firebase Admin Storage). */
export type StorageBucketLike = {
  name: string;
  file: (path: string) => {
    exists: () => Promise<[boolean]>;
    save: (data: Buffer, opts?: object) => Promise<void>;
    makePublic: () => Promise<unknown>;
  };
};

export function hashWpAssetUrl(u: string): string {
  return createHash("sha256").update(u).digest("hex");
}

export function sha256Buffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

/** Path under `/wp-content/uploads/` without leading slash, or undefined */
export function wpUploadsRelativePathFromUrl(url: string): string | undefined {
  try {
    const { pathname } = new URL(url);
    const marker = "/wp-content/uploads/";
    const i = pathname.indexOf(marker);
    if (i === -1) return undefined;
    return pathname.slice(i + marker.length).replace(/^\/+/, "");
  } catch {
    return undefined;
  }
}

export function safePathSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "x";
}

export async function storageObjectExists(
  bucket: StorageBucketLike,
  objectPath: string
): Promise<boolean> {
  const [exists] = await bucket.file(objectPath).exists();
  return exists;
}

export type WriteMediaOptions = {
  force?: boolean;
  /** In-memory dedupe within one process */
  urlSeen?: Map<string, string>;
};

export type MirrorWpAssetResult = {
  publicUrl: string;
  action: "skipped" | "uploaded" | "repaired" | "seen";
};

/**
 * Download from the WordPress asset URL, upload to Storage, upsert `media_map`.
 * Document id = sha256(source URL) so imports stay idempotent; `sourceWpUrl` stores that URL;
 * `wpUrl` and `publicUrl` store the canonical Storage HTTPS URL.
 */
export async function mirrorWpAssetToStorage(args: {
  wpUrl: string;
  storagePath: string;
  bucket: StorageBucketLike;
  db: Firestore;
  sourceKind: MediaSourceKind;
  extraFields?: Partial<MediaMapDoc>;
  options?: WriteMediaOptions;
}): Promise<MirrorWpAssetResult> {
  const { wpUrl, storagePath, bucket, db, sourceKind, extraFields, options } = args;
  const force = options?.force ?? false;
  const seen = options?.urlSeen;

  if (seen?.has(wpUrl)) {
    return { publicUrl: seen.get(wpUrl)!, action: "seen" };
  }

  const sourceWpUrl = wpUrl;
  const docId = hashWpAssetUrl(sourceWpUrl);
  const ref = db.collection(COLLECTIONS.mediaMap).doc(docId);
  const existingSnap = await ref.get();

  if (existingSnap.exists && !force) {
    const prev = existingSnap.data() as MediaMapDoc;
    const pathToCheck = prev.storagePath;
    if (pathToCheck && (await storageObjectExists(bucket, pathToCheck))) {
      seen?.set(wpUrl, prev.publicUrl);
      return { publicUrl: prev.publicUrl, action: "skipped" };
    }
    /* Firestore row exists but object missing — fall through and re-upload */
  }

  const { buffer, contentType } = await downloadBinary(wpUrl);
  const contentSha256 = sha256Buffer(buffer);

  const customMetadata: Record<string, string> = {
    sourceKind,
    contentSha256,
    wpUrlDigest: docId.slice(0, 16),
  };
  if (extraFields?.wpMediaId != null) {
    customMetadata.wpMediaId = String(extraFields.wpMediaId);
  }
  if (extraFields?.blogPostSlug) {
    customMetadata.blogPostSlug = extraFields.blogPostSlug.slice(0, 200);
  }
  if (extraFields?.resourcesGuideCategory) {
    customMetadata.resourcesGuideCategory = extraFields.resourcesGuideCategory.slice(
      0,
      200
    );
  }

  const publicUrl = await uploadBufferWithMetadata(
    bucket,
    storagePath,
    buffer,
    contentType,
    customMetadata
  );

  const extraClean = Object.fromEntries(
    Object.entries(extraFields ?? {}).filter(
      ([k, v]) =>
        v !== undefined && k !== "wpUrl" && k !== "sourceWpUrl" && k !== "publicUrl"
    )
  ) as Partial<MediaMapDoc>;

  const entry: MediaMapDoc = {
    sourceWpUrl,
    wpUrl: publicUrl,
    storagePath,
    publicUrl,
    mimeType: contentType,
    bytes: buffer.length,
    importedAt: new Date().toISOString(),
    ...extraClean,
    sourceKind,
    contentSha256,
  };

  await ref.set(entry);
  seen?.set(wpUrl, publicUrl);
  const action =
    !existingSnap.exists || force ? "uploaded" : "repaired";
  return { publicUrl, action };
}
