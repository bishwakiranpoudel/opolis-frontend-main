/**
 * One-time (or --force) seed: board, team, and state salary floors from code defaults.
 * Usage: npx tsx scripts/seed-site-content.ts
 *        npx tsx scripts/seed-site-content.ts --force
 *
 * Requires Firebase Admin env (same as other scripts): `.env.local` with
 * FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.
 */
import "./wp-import/config";
import { getFirestore } from "firebase-admin/firestore";
import { STATE_FLOORS } from "../src/lib/constants";
import { getFirebaseAdmin } from "../src/lib/firebase/admin";
import { COLLECTIONS, STATE_FLOORS_DOC_ID } from "../src/lib/firebase/schema";
import type { PeopleEntryDoc, StateFloorsDoc } from "../src/lib/firebase/types";
import {
  FALLBACK_BOARD,
  FALLBACK_TEAM,
} from "../src/lib/site-people-fallback";

const force = process.argv.includes("--force");

function isoNow() {
  return new Date().toISOString();
}

async function seedPeople(forceSeed: boolean) {
  const db = getFirestore();
  const col = db.collection(COLLECTIONS.peopleEntries);
  const existing = await col.limit(1).get();
  if (!existing.empty && !forceSeed) {
    console.log("Skip people_entries: documents already exist (use --force to replace).");
    return;
  }
  if (forceSeed && !existing.empty) {
    const all = await col.get();
    const delBatch = db.batch();
    for (const d of all.docs) delBatch.delete(d.ref);
    await delBatch.commit();
    console.log(`Deleted ${all.docs.length} people_entries rows (--force).`);
  }

  const batch = db.batch();
  let orderB = 0;
  for (const r of FALLBACK_BOARD) {
    const ref = col.doc();
    const doc: PeopleEntryDoc = {
      section: "board",
      name: r.n,
      title: r.t,
      sortOrder: orderB++,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    batch.set(ref, doc);
  }
  let orderT = 0;
  for (const r of FALLBACK_TEAM) {
    const ref = col.doc();
    const doc: PeopleEntryDoc = {
      section: "team",
      name: r.n,
      title: r.t,
      sortOrder: orderT++,
      createdAt: isoNow(),
      updatedAt: isoNow(),
    };
    batch.set(ref, doc);
  }
  await batch.commit();
  console.log(
    `Wrote people_entries: ${FALLBACK_BOARD.length} board, ${FALLBACK_TEAM.length} team.`
  );
}

async function seedStateFloors(forceSeed: boolean) {
  const db = getFirestore();
  const ref = db.collection(COLLECTIONS.siteEligibility).doc(STATE_FLOORS_DOC_ID);
  const snap = await ref.get();
  if (snap.exists && !forceSeed) {
    console.log("Skip site_eligibility/state_floors: doc already exists (use --force to replace).");
    return;
  }
  const doc: StateFloorsDoc = {
    floors: { ...STATE_FLOORS },
    effectiveYear: "2026",
    updatedAt: isoNow(),
    source: "static_seed",
  };
  await ref.set(doc);
  console.log("Wrote site_eligibility/state_floors with static STATE_FLOORS map.");
}

async function main() {
  getFirebaseAdmin();
  await seedPeople(force);
  await seedStateFloors(force);
  console.log("Done.");
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
