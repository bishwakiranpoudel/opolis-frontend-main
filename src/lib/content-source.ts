/**
 * Single place for blog / resources data source (Firestore vs WordPress).
 * Default is Firestore when not explicitly set to wordpress.
 */

export type ContentSource = "firestore" | "wordpress";

export function getContentSource(): ContentSource {
  const raw = process.env.CONTENT_SOURCE?.toLowerCase().trim();
  if (raw === "wordpress") return "wordpress";
  return "firestore";
}

export function isFirestoreContent(): boolean {
  return getContentSource() === "firestore";
}
