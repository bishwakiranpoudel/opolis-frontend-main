import { WP_IMPORT_MAX_BYTES } from "../config";

/** Firebase Admin Storage bucket (google-cloud/storage). */
type GcsBucket = { name: string; file: (path: string) => GcsFile };
type GcsFile = {
  save: (data: Buffer, opts?: object) => Promise<void>;
  makePublic: () => Promise<unknown>;
};

export async function downloadBinary(
  url: string,
  maxBytes: number = WP_IMPORT_MAX_BYTES
): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url, {
    headers: { "User-Agent": "opolis-wp-import/1.0" },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Download failed ${res.status}: ${url}`);
  }
  const len = res.headers.get("content-length");
  if (len && parseInt(len, 10) > maxBytes) {
    throw new Error(`Asset too large (content-length): ${url}`);
  }
  const ab = await res.arrayBuffer();
  if (ab.byteLength > maxBytes) {
    throw new Error(`Asset too large: ${url}`);
  }
  const raw = res.headers.get("content-type") || "application/octet-stream";
  const contentType = raw.split(";")[0].trim();
  return { buffer: Buffer.from(ab), contentType };
}

/** Public URL for a publicly readable object in GCS / Firebase Storage. */
export function gcsPublicUrl(bucketName: string, objectPath: string): string {
  const encoded = objectPath
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `https://storage.googleapis.com/${bucketName}/${encoded}`;
}

export async function uploadBufferMakePublic(
  bucket: GcsBucket,
  objectPath: string,
  buffer: Buffer,
  contentType: string,
  customMetadata?: Record<string, string>
): Promise<string> {
  return uploadBufferWithMetadata(
    bucket,
    objectPath,
    buffer,
    contentType,
    customMetadata
  );
}

export async function uploadBufferWithMetadata(
  bucket: GcsBucket,
  objectPath: string,
  buffer: Buffer,
  contentType: string,
  customMetadata?: Record<string, string>
): Promise<string> {
  const file = bucket.file(objectPath);
  await file.save(buffer, {
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000",
      ...(customMetadata && Object.keys(customMetadata).length > 0
        ? {
            metadata: Object.fromEntries(
              Object.entries(customMetadata).map(([k, v]) => [
                k,
                v.length > 800 ? v.slice(0, 800) : v,
              ])
            ),
          }
        : {}),
    },
  });
  await file.makePublic().catch(() => {
    /* UBLA or rules may block; URL may still work with rules */
  });
  return gcsPublicUrl(bucket.name, objectPath);
}
