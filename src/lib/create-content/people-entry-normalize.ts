import type { PeopleEntryDoc, PeopleSection } from "@/lib/firebase/types";

export type PeopleEntryWithId = PeopleEntryDoc & { id: string };

/**
 * Coerce Firestore data into a stable shape for the CMS. Missing / wrong
 * types (e.g. null name) otherwise break controlled inputs and saves.
 */
export function normalizePeopleRow(
  id: string,
  raw: Record<string, unknown>,
  fallbackSection: PeopleSection
): PeopleEntryWithId {
  const section: PeopleSection =
    raw.section === "board" || raw.section === "team"
      ? raw.section
      : fallbackSection;
  const name = typeof raw.name === "string" ? raw.name : "";
  const title = typeof raw.title === "string" ? raw.title : "";
  return {
    id,
    section,
    name,
    title,
    avatarUrl:
      typeof raw.avatarUrl === "string" && raw.avatarUrl.trim()
        ? raw.avatarUrl.trim()
        : undefined,
    sortOrder:
      typeof raw.sortOrder === "number" && Number.isFinite(raw.sortOrder)
        ? raw.sortOrder
        : 0,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : "1970-01-01T00:00:00.000Z",
    updatedAt:
      typeof raw.updatedAt === "string" ? raw.updatedAt : "1970-01-01T00:00:00.000Z",
  };
}
