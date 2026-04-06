import path from "node:path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), ".env") });

export const WORDPRESS_URL = (process.env.WORDPRESS_URL || "").replace(/\/$/, "");
export const WORDPRESS_API_TOKEN = process.env.WORDPRESS_API_TOKEN || "";
export const FIREBASE_STORAGE_BUCKET =
  process.env.FIREBASE_STORAGE_BUCKET ||
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  "";

/** Max size for a single downloaded asset (posts, guides, media library). Default 200 MiB. */
export const WP_IMPORT_MAX_BYTES = (() => {
  const raw = process.env.WP_IMPORT_MAX_BYTES;
  if (raw && /^\d+$/.test(raw.trim())) return parseInt(raw.trim(), 10);
  return 200 * 1024 * 1024;
})();

export function requireWordPressUrl(): string {
  if (!WORDPRESS_URL) {
    throw new Error("Set WORDPRESS_URL in .env or .env.local");
  }
  return WORDPRESS_URL;
}

export function wpHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "opolis-wp-import/1.0",
  };
  if (WORDPRESS_API_TOKEN) {
    h.Authorization = `Bearer ${WORDPRESS_API_TOKEN}`;
  }
  return h;
}
