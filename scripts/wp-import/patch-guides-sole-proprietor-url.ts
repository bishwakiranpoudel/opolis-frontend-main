/**
 * One-time patch: set Entity Creation → "Sole Proprietor vs. LLC" to the in-site blog path
 * so Resources uses Next.js client navigation (internal URL format).
 *
 * Usage: npx tsx scripts/wp-import/patch-guides-sole-proprietor-url.ts
 * Requires Firebase Admin credentials (same as other wp-import scripts).
 */

import "./config";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS, RESOURCES_GUIDES_DOC_ID } from "../../src/lib/firebase/schema";

const LABEL = "Sole Proprietor vs. LLC";
const NEW_URL = "/blog/understanding-the-differences-sole-proprietor-vs-llc";

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

type GuideItem = { type: string; label: string; url: string };
type GuideSection = { cat: string; cc: string; items: GuideItem[] };

function parseSections(data: Record<string, unknown>): GuideSection[] | null {
  const fromGuides = coerceFirestoreArray(data.guides);
  if (fromGuides.length === 0) return null;
  const sections: GuideSection[] = [];
  for (const raw of fromGuides) {
    if (!raw || typeof raw !== "object") continue;
    const o = raw as Record<string, unknown>;
    if (typeof o.cat !== "string" || typeof o.cc !== "string") continue;
    const itemsRaw = coerceFirestoreArray(o.items);
    const items: GuideItem[] = [];
    for (const it of itemsRaw) {
      if (!it || typeof it !== "object") continue;
      const i = it as Record<string, unknown>;
      if (
        typeof i.type === "string" &&
        typeof i.label === "string" &&
        typeof i.url === "string"
      ) {
        items.push({ type: i.type, label: i.label, url: i.url });
      }
    }
    if (items.length > 0) sections.push({ cat: o.cat, cc: o.cc, items });
  }
  return sections.length > 0 ? sections : null;
}

async function main() {
  getFirebaseAdmin();
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.resourcesGuides).doc(RESOURCES_GUIDES_DOC_ID);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error("Missing Firestore document:", `${COLLECTIONS.resourcesGuides}/${RESOURCES_GUIDES_DOC_ID}`);
    process.exit(1);
  }

  const data = snap.data() as Record<string, unknown>;
  const sections = parseSections(data);
  if (!sections) {
    console.error("Could not parse guides from document.");
    process.exit(1);
  }

  let changed = false;
  for (const sec of sections) {
    for (const item of sec.items) {
      if (item.label === LABEL && item.url !== NEW_URL) {
        console.log(`Updating "${LABEL}" in "${sec.cat}":\n  ${item.url}\n  → ${NEW_URL}`);
        item.url = NEW_URL;
        changed = true;
      }
    }
  }

  if (!changed) {
    console.log(`No change needed (already "${NEW_URL}" or label not found).`);
    return;
  }

  await ref.set(
    {
      guides: sections,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  console.log("Firestore resources_guides/data updated.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
