/**
 * Read-only: dump shape of resources_guides + resources_faq for debugging UI fallback.
 * Usage: npx tsx scripts/wp-import/inspect-resources-firestore.ts
 */

import "./config";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import {
  COLLECTIONS,
  RESOURCES_FAQ_DOC_ID,
  RESOURCES_GUIDES_DOC_ID,
} from "../../src/lib/firebase/schema";
import {
  getFaqFromFirestore,
  getGuidesFromFirestore,
} from "../../src/lib/firestore-content";
import { FAQ_SECTIONS, GUIDES_DATA } from "../../src/lib/resourcesData";

function describeValue(v: unknown): string {
  if (v == null) return String(v);
  if (Array.isArray(v)) return `array(len=${v.length})`;
  if (typeof v === "object" && v && "toDate" in (v as object)) return "FirestoreTimestamp";
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const keys = Object.keys(o);
    const numeric = keys.filter((k) => /^\d+$/.test(k));
    if (numeric.length > 0 && numeric.length === keys.length)
      return `mapWithNumericKeys(len=${numeric.length})`;
    return `object(keys=${keys.slice(0, 8).join(",")}${keys.length > 8 ? "…" : ""})`;
  }
  return typeof v;
}

function main() {
  console.log("CONTENT_SOURCE env:", process.env.CONTENT_SOURCE || "(unset → app uses firestore)");
  getFirebaseAdmin();
  const db = getFirestore();

  const guidesRef = db
    .collection(COLLECTIONS.resourcesGuides)
    .doc(RESOURCES_GUIDES_DOC_ID);
  const faqRef = db
    .collection(COLLECTIONS.resourcesFaq)
    .doc(RESOURCES_FAQ_DOC_ID);

  const guidesSnap = guidesRef.get();
  const faqSnap = faqRef.get();

  return Promise.all([guidesSnap, faqSnap]).then(async ([g, f]) => {
    console.log("=== resources_guides / data ===");
    console.log("exists:", g.exists);
    if (g.exists) {
      const raw = g.data() as Record<string, unknown> | undefined;
      console.log("top-level keys:", raw ? Object.keys(raw) : []);
      const guidesField = raw?.guides;
      console.log(
        "guides field:",
        describeValue(guidesField),
        Array.isArray(guidesField) ? "" : ""
      );
      if (guidesField && typeof guidesField === "object" && !Array.isArray(guidesField)) {
        const keys = Object.keys(guidesField as object);
        console.log("guides object key sample:", keys.slice(0, 5));
      }
      if (Array.isArray(guidesField) && guidesField[0]) {
        const s0 = guidesField[0] as Record<string, unknown>;
        console.log("guides[0] keys:", Object.keys(s0));
        console.log("guides[0].items:", describeValue(s0.items));
        const items0 = s0.items;
        if (Array.isArray(items0) && items0[0]) {
          const i0 = items0[0] as Record<string, unknown>;
          console.log("guides[0].items[0] keys:", Object.keys(i0));
          console.log(
            "guides[0].items[0].url type:",
            typeof i0.url,
            "sample:",
            String(i0.url).slice(0, 80)
          );
        }
      }
    }

    console.log("\n=== resources_faq / data ===");
    console.log("exists:", f.exists);
    if (f.exists) {
      const raw = f.data() as Record<string, unknown> | undefined;
      console.log("top-level keys:", raw ? Object.keys(raw) : []);
      const faqField = raw?.faq;
      console.log("faq field:", describeValue(faqField));
      if (Array.isArray(faqField) && faqField[0]) {
        const s0 = faqField[0] as Record<string, unknown>;
        console.log("faq[0] keys:", Object.keys(s0));
        console.log("faq[0].items:", describeValue(s0.items));
      }
    }

    console.log("\n=== App parsers (get*FromFirestore) ===");
    let guidesResult: Awaited<ReturnType<typeof getGuidesFromFirestore>>;
    let faqResult: Awaited<ReturnType<typeof getFaqFromFirestore>>;
    try {
      guidesResult = await getGuidesFromFirestore();
      console.log("getGuidesFromFirestore sections:", guidesResult.length);
      const firstUrl = guidesResult[0]?.items[0]?.url ?? "";
      console.log("first guide item url prefix:", firstUrl.slice(0, 72));
      const wpish = guidesResult.some((sec) =>
        sec.items.some((it) => it.url.includes("wp-content/uploads"))
      );
      const storageish = guidesResult.some((sec) =>
        sec.items.some(
          (it) =>
            it.url.includes("storage.googleapis.com") ||
            it.url.includes("firebasestorage")
        )
      );
      console.log("any wp-content/uploads in parsed guides:", wpish);
      console.log("any storage/firebasestorage in parsed guides:", storageish);
      if (guidesResult.length === GUIDES_DATA.length && wpish && !storageish) {
        console.warn(
          "NOTE: Parsed guides look like static GUIDES_DATA (same section count + WP URLs)."
        );
      }
    } catch (e) {
      console.error("getGuidesFromFirestore threw:", e);
    }

    try {
      faqResult = await getFaqFromFirestore();
      console.log("getFaqFromFirestore sections:", faqResult.length);
    } catch (e) {
      console.error("getFaqFromFirestore threw:", e);
    }

    console.log("\nStatic fallbacks: GUIDES_DATA sections", GUIDES_DATA.length);
    console.log("Static fallbacks: FAQ_SECTIONS", FAQ_SECTIONS.length);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
