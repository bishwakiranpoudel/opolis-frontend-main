import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { COLLECTIONS, STATE_FLOORS_DOC_ID } from "@/lib/firebase/schema";
import type { PeopleEntryDoc, PeopleSection, StateFloorsDoc } from "@/lib/firebase/types";

function isoNow() {
  return new Date().toISOString();
}

export async function createPeopleEntry(input: {
  section: PeopleSection;
  name: string;
  title: string;
  avatarUrl?: string;
  sortOrder: number;
}): Promise<string> {
  const name = input.name.trim();
  const title = input.title.trim();
  if (!name || !title) {
    throw new Error("name and title are required");
  }
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.peopleEntries).doc();
  const now = isoNow();
  const doc: PeopleEntryDoc = {
    section: input.section,
    name,
    title,
    avatarUrl: input.avatarUrl?.trim() || undefined,
    sortOrder: Number.isFinite(input.sortOrder) ? input.sortOrder : 0,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(doc);
  return ref.id;
}

export async function updatePeopleEntry(
  id: string,
  patch: Partial<Pick<PeopleEntryDoc, "name" | "title" | "avatarUrl" | "sortOrder">>
): Promise<void> {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.peopleEntries).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new Error("Entry not found");
  }
  const next: Record<string, unknown> = { updatedAt: isoNow() };
  if (patch.name !== undefined) {
    const t = patch.name.trim();
    if (!t) {
      throw new Error("Name cannot be empty");
    }
    next.name = t;
  }
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) {
      throw new Error("Title cannot be empty");
    }
    next.title = t;
  }
  if (patch.avatarUrl !== undefined) {
    const t = patch.avatarUrl.trim();
    next.avatarUrl = t ? t : FieldValue.delete();
  }
  if (patch.sortOrder !== undefined) {
    if (typeof patch.sortOrder !== "number" || !Number.isFinite(patch.sortOrder)) {
      throw new Error("Invalid sort order");
    }
    next.sortOrder = Math.round(patch.sortOrder);
  }
  await ref.update(next);
}

export async function deletePeopleEntry(id: string): Promise<void> {
  const db = getFirestore();
  await db.collection(COLLECTIONS.peopleEntries).doc(id).delete();
}

export async function replaceStateFloorsDoc(input: {
  floors: Record<string, number>;
  effectiveYear?: string;
}): Promise<void> {
  const db = getFirestore();
  const ref = db
    .collection(COLLECTIONS.siteEligibility)
    .doc(STATE_FLOORS_DOC_ID);
  const doc: StateFloorsDoc = {
    floors: input.floors,
    effectiveYear: input.effectiveYear?.trim() || undefined,
    updatedAt: isoNow(),
    source: "cms",
  };
  await ref.set(doc);
}
