/**
 * Firebase Storage URLs on `firebasestorage.googleapis.com` are authorized via **Storage rules**.
 * Plain `storage.googleapis.com/...` URLs use **GCS IAM** — anonymous users need public object
 * ACL / bucket IAM, or they get AccessDenied (see Firebase vs GCS permission models).
 *
 * By default we **keep** Firebase gateway URLs (and convert GCS XML URLs back to them).
 * Set `STORAGE_REWRITE_FIREBASE_TO_GCS=true` only if objects are publicly readable via GCS
 * (e.g. bucket/object allUsers) and you prefer CDN-style URLs.
 */

function storageRewriteFirebaseToGcsEnabled(): boolean {
  return process.env.STORAGE_REWRITE_FIREBASE_TO_GCS === "true";
}

/** Build a public object URL on the storage.googleapis.com host (not the Firebase gateway). */
export function gcsPublicObjectUrl(bucketName: string, objectPath: string): string {
  const pathEncoded = objectPath
    .split("/")
    .filter((s) => s.length > 0)
    .map(encodeURIComponent)
    .join("/");
  return `https://storage.googleapis.com/${bucketName}/${pathEncoded}`;
}

/**
 * `https://storage.googleapis.com/{bucket}/path/to/object` → Firebase Storage REST URL
 * (`.../v0/b/{bucket}/o/{encoded}?alt=media`) so Storage **rules** apply (typical public reads).
 */
export function rewriteStorageGoogleapisToFirebaseGateway(url: string): string {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== "storage.googleapis.com") return url;
    const segments = u.pathname.split("/").filter(Boolean);
    if (segments.length < 2) return url;
    const bucket = segments[0]!;
    const pathSegments = segments.slice(1);
    const encoded = pathSegments.map(encodeURIComponent).join("%2F");
    const qs =
      u.search && u.search !== "?" ? u.search : "?alt=media";
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}${qs}`;
  } catch {
    return url;
  }
}

function forwardFirebaseGatewayUrlToGcs(url: string): string {
  const t = url.trim();
  const m = t.match(
    /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?]+)/i
  );
  if (!m) return url;
  const bucket = m[1];
  let objectPath: string;
  try {
    objectPath = decodeURIComponent(m[2]);
  } catch {
    return url;
  }
  return gcsPublicObjectUrl(bucket, objectPath);
}

/**
 * Single URL: optionally Firebase gateway → GCS; otherwise GCS → Firebase gateway when needed.
 * Prefer this for any stored Storage link shown to anonymous visitors.
 */
export function rewriteFirebaseGatewayUrlToGcsPublic(url: string): string {
  const t = url.trim();
  if (storageRewriteFirebaseToGcsEnabled()) {
    return forwardFirebaseGatewayUrlToGcs(t);
  }
  if (/^https:\/\/storage\.googleapis\.com\//i.test(t)) {
    return rewriteStorageGoogleapisToFirebaseGateway(t);
  }
  return t;
}

/** Replace Storage links inside HTML for public pages. */
export function rewriteFirebaseGatewayUrlsInHtml(html: string): string {
  if (storageRewriteFirebaseToGcsEnabled()) {
    if (!html.includes("firebasestorage.googleapis.com")) return html;
    return html.replace(
      /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/([^?\s"'<>]+)(\?[^\s"'<>]*)?/gi,
      (full, bucket: string, encodedPath: string) => {
        try {
          return gcsPublicObjectUrl(bucket, decodeURIComponent(encodedPath));
        } catch {
          return full;
        }
      }
    );
  }

  if (!html.includes("storage.googleapis.com")) return html;
  return html.replace(
    /https:\/\/storage\.googleapis\.com\/[^?\s"'<>]+(\?[^\s"'<>]*)?/gi,
    (full) => rewriteStorageGoogleapisToFirebaseGateway(full)
  );
}
