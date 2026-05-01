/**
 * Firebase Storage REST URLs (firebasestorage.googleapis.com/v0/b/.../o/...?alt=media)
 * are validated against Firebase Security Rules, so anonymous readers often get 403 even
 * when the object is public in GCS. Direct GCS URLs bypass Rules and work for public objects.
 */

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
 * Rewrites URLs produced by the Firebase Storage REST API (`.../v0/b/{bucket}/o/{encoded}?...`)
 * to equivalent `storage.googleapis.com` URLs. Returns the input if it does not match.
 */
export function rewriteFirebaseGatewayUrlToGcsPublic(url: string): string {
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

/** Replace Firebase Storage REST links in HTML with direct GCS equivalents. */
export function rewriteFirebaseGatewayUrlsInHtml(html: string): string {
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
