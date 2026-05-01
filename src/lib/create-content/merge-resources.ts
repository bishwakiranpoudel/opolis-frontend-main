import { getFirestore } from "firebase-admin/firestore";
import type { FaqItem, FaqSection, GuidesSection } from "@/lib/resourcesData";
import { COLLECTIONS, RESOURCES_FAQ_DOC_ID, RESOURCES_GUIDES_DOC_ID } from "@/lib/firebase/schema";
import type { ResourcesFaqDoc, ResourcesGuidesDoc } from "@/lib/firebase/types";
import { coerceFirestoreArray } from "@/lib/create-content/coerce-firestore-array";

function normalizeFaqItems(items: unknown): FaqItem[] {
  const out: FaqItem[] = [];
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

export function parseFaqSectionsFromDoc(
  data: Record<string, unknown> | undefined
): FaqSection[] {
  if (!data) return [];
  const raw = coerceFirestoreArray(data.faq);
  return raw
    .map(normalizeFaqSection)
    .filter((s): s is FaqSection => s != null);
}

function normalizeGuideItems(
  items: unknown
): GuidesSection["items"] {
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

export function parseGuidesSectionsFromDoc(
  data: Record<string, unknown> | undefined
): GuidesSection[] {
  if (!data) return [];
  const fromGuides = coerceFirestoreArray(data.guides);
  if (fromGuides.length > 0) {
    return fromGuides
      .map(normalizeGuidesSection)
      .filter((s): s is GuidesSection => s != null);
  }
  if (
    typeof data.cat === "string" &&
    typeof data.cc === "string" &&
    data.items != null &&
    data.guides == null
  ) {
    const items = normalizeGuideItems(data.items);
    if (items.length === 0) return [];
    return [{ cat: data.cat, cc: data.cc, items }];
  }
  return [];
}

export async function mergeFaqIntoFirestore(
  mode: "append_section" | "append_items",
  payload: { section: FaqSection } | { sectionId: string; items: FaqItem[] }
): Promise<FaqSection[]> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesFaq).doc(RESOURCES_FAQ_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseFaqSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];

  let next: FaqSection[];
  if (mode === "append_section") {
    const { section } = payload as { section: FaqSection };
    if (!section?.id || !section.label || !section.items?.length) {
      throw new Error("Invalid FAQ section");
    }
    const dup = existing.some((s) => s.id === section.id);
    if (dup) throw new Error(`FAQ section id already exists: ${section.id}`);
    next = [...existing, section];
  } else {
    const { sectionId, items } = payload as {
      sectionId: string;
      items: FaqItem[];
    };
    if (!sectionId || !items?.length) throw new Error("Invalid FAQ items payload");
    const idx = existing.findIndex((s) => s.id === sectionId);
    if (idx === -1) throw new Error(`FAQ section not found: ${sectionId}`);
    const copy = existing.map((s) => ({ ...s, items: [...s.items] }));
    copy[idx]!.items.push(...items);
    next = copy;
  }

  const now = new Date().toISOString();
  const doc: ResourcesFaqDoc = {
    faq: next,
    importedAt: now,
    source: "cms",
  };
  await ref.set(doc, { merge: false });
  return next;
}

export async function mergeGuidesIntoFirestore(
  mode: "append_section" | "append_items",
  payload:
    | { section: GuidesSection }
    | { sectionIndex: number; items: GuidesSection["items"] }
): Promise<GuidesSection[]> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesGuides).doc(RESOURCES_GUIDES_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseGuidesSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];

  let next: GuidesSection[];
  if (mode === "append_section") {
    const { section } = payload as { section: GuidesSection };
    if (!section?.cat || !section.cc || !section.items?.length) {
      throw new Error("Invalid guides section");
    }
    next = [...existing, section];
  } else {
    const { sectionIndex, items } = payload as {
      sectionIndex: number;
      items: GuidesSection["items"];
    };
    if (sectionIndex < 0 || sectionIndex >= existing.length) {
      throw new Error("Invalid guides section index");
    }
    if (!items?.length) throw new Error("No guide items to append");
    next = existing.map((s, i) =>
      i === sectionIndex ? { ...s, items: [...s.items, ...items] } : s
    );
  }

  const now = new Date().toISOString();
  const doc: ResourcesGuidesDoc = {
    guides: next,
    importedAt: now,
    source: "cms",
  };
  await ref.set(doc, { merge: false });
  return next;
}

export async function replaceAllFaqSections(sections: FaqSection[]): Promise<void> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesFaq).doc(RESOURCES_FAQ_DOC_ID);
  const now = new Date().toISOString();
  const doc: ResourcesFaqDoc = {
    faq: sections,
    importedAt: now,
    source: "cms",
  };
  await ref.set(doc, { merge: false });
}

export async function replaceAllGuidesSections(
  sections: GuidesSection[]
): Promise<void> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesGuides).doc(RESOURCES_GUIDES_DOC_ID);
  const now = new Date().toISOString();
  const doc: ResourcesGuidesDoc = {
    guides: sections,
    importedAt: now,
    source: "cms",
  };
  await ref.set(doc, { merge: false });
}

export async function deleteFaqSection(sectionId: string): Promise<FaqSection[]> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesFaq).doc(RESOURCES_FAQ_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseFaqSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];
  const next = existing.filter((s) => s.id !== sectionId);
  if (next.length === existing.length) {
    throw new Error(`FAQ section not found: ${sectionId}`);
  }
  const now = new Date().toISOString();
  await ref.set(
    { faq: next, importedAt: now, source: "cms" } satisfies ResourcesFaqDoc,
    { merge: false }
  );
  return next;
}

export async function updateFaqSection(section: FaqSection): Promise<FaqSection[]> {
  if (!section?.id || !section.label || !section.items?.length) {
    throw new Error("Invalid FAQ section");
  }
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesFaq).doc(RESOURCES_FAQ_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseFaqSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];
  const idx = existing.findIndex((s) => s.id === section.id);
  if (idx === -1) throw new Error(`FAQ section not found: ${section.id}`);
  const next = existing.map((s, i) => (i === idx ? section : s));
  const now = new Date().toISOString();
  await ref.set(
    { faq: next, importedAt: now, source: "cms" } satisfies ResourcesFaqDoc,
    { merge: false }
  );
  return next;
}

export async function deleteFaqItem(
  sectionId: string,
  itemIndex: number
): Promise<FaqSection[]> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesFaq).doc(RESOURCES_FAQ_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseFaqSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];
  const idx = existing.findIndex((s) => s.id === sectionId);
  if (idx === -1) throw new Error(`FAQ section not found: ${sectionId}`);
  const sec = existing[idx]!;
  const items = sec.items.filter((_, i) => i !== itemIndex);
  if (items.length === sec.items.length) throw new Error("Invalid item index");
  if (items.length === 0) throw new Error("Section must keep at least one Q&A");
  const next = existing.map((s, i) =>
    i === idx ? { ...s, items } : s
  );
  const now = new Date().toISOString();
  await ref.set(
    { faq: next, importedAt: now, source: "cms" } satisfies ResourcesFaqDoc,
    { merge: false }
  );
  return next;
}

export async function deleteGuidesSection(sectionIndex: number): Promise<GuidesSection[]> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesGuides).doc(RESOURCES_GUIDES_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseGuidesSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];
  if (sectionIndex < 0 || sectionIndex >= existing.length) {
    throw new Error("Invalid guides section index");
  }
  const next = existing.filter((_, i) => i !== sectionIndex);
  const now = new Date().toISOString();
  await ref.set(
    {
      guides: next,
      importedAt: now,
      source: "cms",
    } satisfies ResourcesGuidesDoc,
    { merge: false }
  );
  return next;
}

export async function updateGuidesSection(
  sectionIndex: number,
  section: GuidesSection
): Promise<GuidesSection[]> {
  if (!section?.cat || !section.cc || !section.items?.length) {
    throw new Error("Invalid guides section");
  }
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesGuides).doc(RESOURCES_GUIDES_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseGuidesSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];
  if (sectionIndex < 0 || sectionIndex >= existing.length) {
    throw new Error("Invalid guides section index");
  }
  const next = existing.map((s, i) => (i === sectionIndex ? section : s));
  const now = new Date().toISOString();
  await ref.set(
    {
      guides: next,
      importedAt: now,
      source: "cms",
    } satisfies ResourcesGuidesDoc,
    { merge: false }
  );
  return next;
}

export async function deleteGuidesItem(
  sectionIndex: number,
  itemIndex: number
): Promise<GuidesSection[]> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesGuides).doc(RESOURCES_GUIDES_DOC_ID);
  const snap = await ref.get();
  const existing = snap.exists
    ? parseGuidesSectionsFromDoc(snap.data() as Record<string, unknown>)
    : [];
  if (sectionIndex < 0 || sectionIndex >= existing.length) {
    throw new Error("Invalid guides section index");
  }
  const sec = existing[sectionIndex]!;
  const items = sec.items.filter((_, i) => i !== itemIndex);
  if (items.length === sec.items.length) throw new Error("Invalid item index");
  if (items.length === 0) throw new Error("Section must keep at least one link row");
  const next = existing.map((s, i) =>
    i === sectionIndex ? { ...s, items } : s
  );
  const now = new Date().toISOString();
  await ref.set(
    {
      guides: next,
      importedAt: now,
      source: "cms",
    } satisfies ResourcesGuidesDoc,
    { merge: false }
  );
  return next;
}
