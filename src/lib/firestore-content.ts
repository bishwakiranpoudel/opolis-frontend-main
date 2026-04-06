/**
 * Read blog + resources content from Firestore (migrated from WordPress).
 * Default content path (when CONTENT_SOURCE is not wordpress). Requires Firebase Admin on the server.
 */

import { getFirestore } from "firebase-admin/firestore";
import type { BlogPost, FullBlogPost } from "@/lib/blogPosts";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { COLLECTIONS, RESOURCES_FAQ_DOC_ID, RESOURCES_GUIDES_DOC_ID } from "@/lib/firebase/schema";
import type { BlogPostDoc } from "@/lib/firebase/types";
import type { FaqSection, GuidesSection } from "@/lib/resourcesData";
import { FAQ_SECTIONS, GUIDES_DATA } from "@/lib/resourcesData";

/**
 * Some Firestore writes expose arrays as maps with numeric keys; Admin returns a plain object, not [].
 */
function coerceFirestoreArray(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o).filter((k) => /^\d+$/.test(k));
    if (keys.length === 0) return [];
    return keys
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => o[k]);
  }
  return [];
}

function normalizeGuideItems(items: unknown): GuidesSection["items"] {
  const out: GuidesSection["items"] = [];
  for (const it of coerceFirestoreArray(items)) {
    if (!it || typeof it !== "object") continue;
    const i = it as Record<string, unknown>;
    if (
      typeof i.type === "string" &&
      typeof i.label === "string" &&
      typeof i.url === "string"
    ) {
      out.push({ type: i.type, label: i.label, url: i.url });
    }
  }
  return out;
}

function normalizeGuidesSection(raw: unknown): GuidesSection | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.cat !== "string" || typeof o.cc !== "string") return null;
  const items = normalizeGuideItems(o.items);
  if (items.length === 0) return null;
  return { cat: o.cat, cc: o.cc, items };
}

/** Parse `resources_guides/data` whether `guides` is a real array or a numeric-key map. */
function parseGuidesFromDocData(
  data: Record<string, unknown> | undefined
): GuidesSection[] | null {
  if (!data) return null;
  const fromGuides = coerceFirestoreArray(data.guides);
  if (fromGuides.length > 0) {
    const sections = fromGuides
      .map(normalizeGuidesSection)
      .filter((s): s is GuidesSection => s != null);
    if (sections.length > 0) return sections;
  }
  if (
    typeof data.cat === "string" &&
    typeof data.cc === "string" &&
    data.items != null &&
    data.guides == null
  ) {
    const items = normalizeGuideItems(data.items);
    if (items.length === 0) return null;
    return [{ cat: data.cat, cc: data.cc, items }];
  }
  return null;
}

function normalizeFaqItems(items: unknown): FaqSection["items"] {
  const out: FaqSection["items"] = [];
  for (const it of coerceFirestoreArray(items)) {
    if (!it || typeof it !== "object") continue;
    const i = it as Record<string, unknown>;
    if (typeof i.q === "string" && typeof i.a === "string") {
      out.push({ q: i.q, a: i.a });
    }
  }
  return out;
}

function normalizeFaqSection(raw: unknown): FaqSection | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string") return null;
  const items = normalizeFaqItems(o.items);
  if (items.length === 0) return null;
  return { id: o.id, label: o.label, items };
}

function parseFaqFromDocData(
  data: Record<string, unknown> | undefined
): FaqSection[] | null {
  if (!data) return null;
  const raw = coerceFirestoreArray(data.faq);
  if (raw.length === 0) return null;
  const sections = raw
    .map(normalizeFaqSection)
    .filter((s): s is FaqSection => s != null);
  return sections.length > 0 ? sections : null;
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return isoDate.slice(0, 10);
  }
}

function docToBlogPost(d: BlogPostDoc): BlogPost {
  return {
    cat: d.cat,
    cc: d.cc,
    date: formatDate(d.dateIso),
    h: d.title,
    url: d.legacyPermalink || "",
    slug: d.slug,
    dateIso: d.dateIso,
  };
}

function docToFullBlogPost(d: BlogPostDoc): FullBlogPost {
  const base = docToBlogPost(d);
  return {
    ...base,
    content: d.contentHtml,
    excerpt: d.excerptHtml,
    modified: d.modifiedIso ? formatDate(d.modifiedIso) : undefined,
    dateIso: d.dateIso,
    modifiedIso: d.modifiedIso,
  };
}

/** Apply optional manual URL rewrites from blog HTML (SEO migration). */
export function applyUrlRewriteMap(html: string): string {
  const raw = process.env.CONTENT_URL_REWRITE_MAP_JSON;
  if (!raw?.trim()) return html;
  try {
    const map = JSON.parse(raw) as Record<string, string>;
    let out = html;
    for (const [from, to] of Object.entries(map)) {
      if (from && to) out = out.split(from).join(to);
    }
    return out;
  } catch {
    return html;
  }
}

export async function getBlogPostsFromFirestore(): Promise<BlogPost[]> {
  getFirebaseAdmin();
  const db = getFirestore();
  const snap = await db
    .collection(COLLECTIONS.blogPosts)
    .orderBy("dateIso", "desc")
    .get();
  const out: BlogPost[] = [];
  snap.forEach((doc) => {
    const d = doc.data() as BlogPostDoc;
    out.push(docToBlogPost(d));
  });
  return out;
}

export async function getBlogPostBySlugFromFirestore(
  slug: string
): Promise<FullBlogPost | null> {
  if (!slug) return null;
  getFirebaseAdmin();
  const db = getFirestore();
  const ref = await db.collection(COLLECTIONS.blogPosts).doc(slug).get();
  if (!ref.exists) return null;
  const d = ref.data() as BlogPostDoc;
  const full = docToFullBlogPost(d);
  return {
    ...full,
    content: applyUrlRewriteMap(full.content),
    excerpt: applyUrlRewriteMap(full.excerpt),
  };
}

export async function getGuidesFromFirestore(): Promise<GuidesSection[]> {
  getFirebaseAdmin();
  const db = getFirestore();
  const ref = await db
    .collection(COLLECTIONS.resourcesGuides)
    .doc(RESOURCES_GUIDES_DOC_ID)
    .get();
  if (!ref.exists) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_guides/data missing; using static GUIDES_DATA"
      );
    }
    return GUIDES_DATA;
  }
  const parsed = parseGuidesFromDocData(
    ref.data() as Record<string, unknown> | undefined
  );
  if (!parsed?.length) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_guides/data could not parse guides; using static GUIDES_DATA. Keys:",
        Object.keys(ref.data() ?? {})
      );
    }
    return GUIDES_DATA;
  }
  return parsed;
}

export async function getFaqFromFirestore(): Promise<FaqSection[]> {
  getFirebaseAdmin();
  const db = getFirestore();
  const ref = await db
    .collection(COLLECTIONS.resourcesFaq)
    .doc(RESOURCES_FAQ_DOC_ID)
    .get();
  if (!ref.exists) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_faq/data missing; using static FAQ_SECTIONS"
      );
    }
    return FAQ_SECTIONS;
  }
  const parsed = parseFaqFromDocData(
    ref.data() as Record<string, unknown> | undefined
  );
  if (!parsed?.length) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[Firestore] resources_faq/data could not parse faq; using static FAQ_SECTIONS. Keys:",
        Object.keys(ref.data() ?? {})
      );
    }
    return FAQ_SECTIONS;
  }
  return parsed;
}
