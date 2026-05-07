import { getFirestore } from "firebase-admin/firestore";
import { STATE_FLOORS } from "@/lib/constants";
import {
  FALLBACK_BOARD,
  FALLBACK_TEAM,
} from "@/lib/site-people-fallback";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { COLLECTIONS, STATE_FLOORS_DOC_ID } from "@/lib/firebase/schema";
import type { PeopleEntryDoc, PeopleSection } from "@/lib/firebase/types";
import { normalizeStoredFirebaseMediaUrl } from "@/lib/firebase/storage-bucket-remap";
import { mergeStateFloorsFromStored } from "@/lib/state-floors-merge";

export type SitePersonPublic = {
  name: string;
  title: string;
  avatarUrl?: string;
};

function fallbackPeople(section: PeopleSection): SitePersonPublic[] {
  const rows = section === "board" ? FALLBACK_BOARD : FALLBACK_TEAM;
  return rows.map((r) => ({
    name: r.n,
    title: r.t,
  }));
}

/** Shown when legacy/bad data has empty strings — card still renders. */
const MISSING_LABEL = "\u2014";

export async function getPeopleForPublic(
  section: PeopleSection
): Promise<SitePersonPublic[]> {
  try {
    getFirebaseAdmin();
    const db = getFirestore();
    const snap = await db
      .collection(COLLECTIONS.peopleEntries)
      .where("section", "==", section)
      .get();
    if (snap.empty) {
      return fallbackPeople(section);
    }
    const rows = snap.docs
      .map((d) => {
        const x = d.data() as Partial<PeopleEntryDoc>;
        const sortOrder =
          typeof x.sortOrder === "number" && Number.isFinite(x.sortOrder)
            ? x.sortOrder
            : 0;
        const rawName = typeof x.name === "string" ? x.name.trim() : "";
        const rawTitle = typeof x.title === "string" ? x.title.trim() : "";
        return {
          sortOrder,
          name: rawName,
          title: rawTitle,
          avatarUrl: normalizeStoredFirebaseMediaUrl(
            typeof x.avatarUrl === "string" ? x.avatarUrl : undefined
          ),
        };
      })
      .sort(
        (a, b) =>
          (Number.isFinite(a.sortOrder) ? a.sortOrder : 0) -
          (Number.isFinite(b.sortOrder) ? b.sortOrder : 0)
      );
    return rows.map(({ name, title, avatarUrl }) => ({
      name: name || MISSING_LABEL,
      title: title || MISSING_LABEL,
      avatarUrl,
    }));
  } catch {
    return fallbackPeople(section);
  }
}

export function getUsStatesSorted(floors: Record<string, number>): string[] {
  return Object.keys(floors).sort();
}

export async function getResolvedStateFloors(): Promise<
  Record<string, number>
> {
  try {
    getFirebaseAdmin();
    const db = getFirestore();
    const ref = db
      .collection(COLLECTIONS.siteEligibility)
      .doc(STATE_FLOORS_DOC_ID);
    const doc = await ref.get();
    if (!doc.exists) {
      return { ...STATE_FLOORS };
    }
    const data = doc.data() as { floors?: unknown } | undefined;
    return mergeStateFloorsFromStored(data?.floors);
  } catch {
    return { ...STATE_FLOORS };
  }
}
