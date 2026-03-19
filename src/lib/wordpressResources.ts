/**
 * WordPress-backed Resources data: Guides and FAQ.
 * Fetches from optional REST endpoints so content can be managed in WordPress.
 * Falls back to static data from resourcesData when endpoints are not set or fail.
 *
 * Optional endpoints (same base as WORDPRESS_URL):
 *   GET /wp-json/opolis/v1/guides  → { guides: GuidesSection[] }
 *   GET /wp-json/opolis/v1/faq     → { faq: FaqSection[] }
 *
 * If you add a small WordPress plugin or theme code to register these routes
 * and return the same JSON shape, the Resources page will use WP content
 * and redirect links from there instead of static lists.
 */

import type { FaqSection, GuidesSection } from "@/lib/resourcesData";
import { FAQ_SECTIONS, GUIDES_DATA } from "@/lib/resourcesData";

const WORDPRESS_URL = process.env.WORDPRESS_URL || "";
const REVALIDATE_SECONDS = 60;

function getBaseUrl(): string {
  return WORDPRESS_URL.replace(/\/$/, "");
}

function isGuidesSection(x: unknown): x is GuidesSection {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.cat !== "string" || typeof o.cc !== "string") return false;
  if (!Array.isArray(o.items)) return false;
  return o.items.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    return typeof i.type === "string" && typeof i.label === "string" && typeof i.url === "string";
  });
}

function isFaqSection(x: unknown): x is FaqSection {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string") return false;
  if (!Array.isArray(o.items)) return false;
  return o.items.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    return typeof i.q === "string" && typeof i.a === "string";
  });
}

/**
 * Fetches Guides from WordPress if the optional endpoint exists.
 * Returns the same shape as GUIDES_DATA: categories with items (type, label, url).
 * Links in items can be external (PDFs, learn.opolis.co, etc.) or internal (/blog/slug).
 */
export async function getGuides(): Promise<GuidesSection[]> {
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
