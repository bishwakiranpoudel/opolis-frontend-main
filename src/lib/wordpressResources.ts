/**
 * Resources: Guides and FAQ from Firestore (default) or WordPress REST when
 * CONTENT_SOURCE=wordpress. Falls back to static GUIDES_DATA / FAQ_SECTIONS.
 *
 * WordPress optional endpoints (same base as WORDPRESS_URL):
 *   GET /wp-json/opolis/v1/guides  → { guides: GuidesSection[] }
 *   GET /wp-json/opolis/v1/faq     → { faq: FaqSection[] }
 */

import type { FaqSection, GuidesSection } from "@/lib/resourcesData";
import { getContentSource } from "@/lib/content-source";
import {
  FAQ_SECTIONS,
  GUIDES_DATA,
  isFaqSection,
  isGuidesSection,
} from "@/lib/resourcesData";

const WORDPRESS_URL = process.env.WORDPRESS_URL || "";
const REVALIDATE_SECONDS = 60;

function getBaseUrl(): string {
  return WORDPRESS_URL.replace(/\/$/, "");
}

/**
 * Fetches Guides from WordPress if the optional endpoint exists.
 * Returns the same shape as GUIDES_DATA: categories with items (type, label, url).
 * Links in items can be external (PDFs, learn.opolis.co, etc.) or internal (/blog/slug).
 */
export async function getGuides(): Promise<GuidesSection[]> {
  if (getContentSource() === "firestore") {
    try {
      const { getGuidesFromFirestore } = await import("@/lib/firestore-content");
      return await getGuidesFromFirestore();
    } catch (err) {
      console.error(
        "[Firestore] getGuides failed; using static GUIDES_DATA (WordPress URLs).",
        err,
        "Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS on the server."
      );
      return GUIDES_DATA;
    }
  }

  if (!WORDPRESS_URL) return GUIDES_DATA;

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/wp-json/opolis/v1/guides`;

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WORDPRESS_API_TOKEN && {
          Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
        }),
      },
    });

    if (!res.ok) return GUIDES_DATA;

    const data = await res.json();
    const list = Array.isArray(data?.guides) ? data.guides : data;
    if (!Array.isArray(list)) return GUIDES_DATA;

    const valid = list.filter(isGuidesSection);
    if (valid.length === 0) return GUIDES_DATA;

    return valid;
  } catch {
    return GUIDES_DATA;
  }
}

/**
 * Fetches FAQ sections from WordPress if the optional endpoint exists.
 * Returns the same shape as FAQ_SECTIONS: sections with id, label, items (q, a).
 */
export async function getFaq(): Promise<FaqSection[]> {
  if (getContentSource() === "firestore") {
    try {
      const { getFaqFromFirestore } = await import("@/lib/firestore-content");
      return await getFaqFromFirestore();
    } catch (err) {
      console.error(
        "[Firestore] getFaq failed; using static FAQ_SECTIONS.",
        err,
        "Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS on the server."
      );
      return FAQ_SECTIONS;
    }
  }

  if (!WORDPRESS_URL) return FAQ_SECTIONS;

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/wp-json/opolis/v1/faq`;

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WORDPRESS_API_TOKEN && {
          Authorization: `Bearer ${process.env.WORDPRESS_API_TOKEN}`,
        }),
      },
    });

    if (!res.ok) return FAQ_SECTIONS;

    const data = await res.json();
    const list = Array.isArray(data?.faq) ? data.faq : data;
    if (!Array.isArray(list)) return FAQ_SECTIONS;

    const valid = list.filter(isFaqSection);
    if (valid.length === 0) return FAQ_SECTIONS;

    return valid;
  } catch {
    return FAQ_SECTIONS;
  }
}
