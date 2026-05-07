/**
 * Rewrite Firebase Storage bucket ids embedded in Firestore string fields so URLs match
 * the production bucket after a project migration (same object paths, new bucket name).
 *
 * Targets collections that hold HTML, media URLs, or FAQ/guide links. Uses production
 * credentials by default (`production.json`).
 *
 * Usage:
 *   npx tsx scripts/firestore-rewrite-storage-buckets.ts --dry-run
 *   npx tsx scripts/firestore-rewrite-storage-buckets.ts --yes
 *
 * Env:
 *   REWRITE_FIRESTORE_CREDENTIALS — path to service account JSON (default: production.json)
 *   NEW_STORAGE_BUCKET — destination bucket id (default: PROJECT_ID.firebasestorage.app from JSON)
 *   OLD_STORAGE_BUCKETS — comma-separated legacy bucket ids (defaults include studio buckets)
 */
import fs from "node:fs";
import path from "node:path";
import * as readline from "node:readline";
import type { ServiceAccount } from "firebase-admin";
import { cert, deleteApp, getApps, initializeApp } from "firebase-admin/app";
import type { DocumentData } from "firebase-admin/firestore";
import {
  DocumentReference,
  GeoPoint,
  Timestamp,
  getFirestore,
} from "firebase-admin/firestore";
import { COLLECTIONS } from "../src/lib/firebase/schema";
import {
  DEFAULT_LEGACY_STORAGE_BUCKETS,
  rewriteStorageBucketsInString,
  type BucketMapping,
} from "../src/lib/firebase/storage-bucket-remap";

const APP_NAME = "firestore-rewrite-storage";
const argv = new Set(process.argv.slice(2));
const dryRun = argv.has("--dry-run");
const skipConfirm = argv.has("--yes");

const CRED_PATH =
  process.env.REWRITE_FIRESTORE_CREDENTIALS ||
  path.resolve(process.cwd(), "production.json");

function loadCred(): ServiceAccount & { project_id?: string } {
  const raw = fs.readFileSync(CRED_PATH, "utf8");
  return JSON.parse(raw) as ServiceAccount & { project_id?: string };
}

function projectIdFromCred(
  c: ServiceAccount & { project_id?: string }
): string {
  const id =
    (c as { project_id?: string }).project_id ||
    (c as { projectId?: string }).projectId ||
    "";
  if (!id) throw new Error("Service account JSON missing project_id");
  return id;
}

function promptYes(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

function stableSerializeFirestoreValue(data: unknown): string {
  return JSON.stringify(data, (_key, val) => {
    if (val instanceof Timestamp) {
      return {
        __ts: "Timestamp",
        seconds: val.seconds,
        nanoseconds: val.nanoseconds,
      };
    }
    if (val instanceof GeoPoint) {
      return {
        __geo: "GeoPoint",
        lat: val.latitude,
        lng: val.longitude,
      };
    }
    if (val instanceof DocumentReference) {
      return { __ref: val.path };
    }
    return val;
  });
}

function deepRewriteStrings(
  value: unknown,
  rewrite: (s: string) => string
): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return rewrite(value);
  if (typeof value !== "object") return value;
  if (value instanceof Timestamp) return value;
  if (value instanceof GeoPoint) return value;
  if (value instanceof DocumentReference) return value;
  if (Array.isArray(value)) {
    return value.map((v) => deepRewriteStrings(v, rewrite));
  }
  const o = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) {
    out[k] = deepRewriteStrings(v, rewrite);
  }
  return out;
}

/** Collections that may embed Storage or Firebase URLs in string fields. */
const COLLECTIONS_TO_SCAN: string[] = [
  COLLECTIONS.blogPosts,
  COLLECTIONS.podcastEpisodes,
  COLLECTIONS.mediaMap,
  COLLECTIONS.resourcesGuides,
  COLLECTIONS.resourcesFaq,
  COLLECTIONS.peopleEntries,
  COLLECTIONS.urlMapPending,
];

async function main(): Promise<void> {
  const credJson = loadCred();
  const projectId = projectIdFromCred(credJson);

  const newBucket =
    process.env.NEW_STORAGE_BUCKET?.trim() ||
    `${projectId}.firebasestorage.app`;

  const oldBucketsRaw =
    process.env.OLD_STORAGE_BUCKETS?.trim() ||
    DEFAULT_LEGACY_STORAGE_BUCKETS.join(",");

  const oldBuckets = oldBucketsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const mappings: BucketMapping[] = oldBuckets.map((from) => ({
    from,
    to: newBucket,
  }));

  console.log("Firestore Storage bucket URL rewrite");
  console.log(`  Credential file: ${CRED_PATH}`);
  console.log(`  Project:         ${projectId}`);
  console.log(`  New bucket:      ${newBucket}`);
  console.log(`  Legacy buckets:  ${oldBuckets.join(", ")}`);
  console.log(`  Dry run:         ${dryRun}`);

  if (!dryRun && !skipConfirm) {
    const ok = await promptYes(
      "This writes to Firestore in the project above. Type yes to continue: "
    );
    if (!ok) {
      console.log("Aborted.");
      process.exit(1);
    }
  }

  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) await deleteApp(existing).catch(() => undefined);

  const app = initializeApp(
    {
      credential: cert(credJson as ServiceAccount),
      projectId,
    },
    APP_NAME
  );

  const db = getFirestore(app);
  const rewriter = (s: string) =>
    rewriteStorageBucketsInString(s, mappings);

  type Pending = {
    ref: DocumentReference;
    data: DocumentData;
  };
  const pending: Pending[] = [];

  async function flushBatch(): Promise<void> {
    if (pending.length === 0) return;
    const slice = pending.splice(0, 450);
    const batch = db.batch();
    for (const { ref, data } of slice) {
      batch.set(ref, data);
    }
    await batch.commit();
    if (pending.length > 0) await flushBatch();
  }

  let totalDocsUpdated = 0;

  try {
    for (const collectionId of COLLECTIONS_TO_SCAN) {
      console.log(`\nCollection: ${collectionId}`);
      const snap = await db.collection(collectionId).get();
      let colUpdated = 0;
      for (const doc of snap.docs) {
        if (!doc.exists) continue;
        const raw = doc.data();
        if (!raw) continue;
        const next = deepRewriteStrings(raw, rewriter) as DocumentData;
        if (
          stableSerializeFirestoreValue(raw) ===
          stableSerializeFirestoreValue(next)
        ) {
          continue;
        }
        colUpdated++;
        console.log(`  → ${doc.id}`);
        if (!dryRun) {
          pending.push({ ref: doc.ref, data: next });
          if (pending.length >= 450) await flushBatch();
        }
      }
      console.log(
        `  (${snap.size} docs scanned, ${colUpdated} ${dryRun ? "would update" : "updated"})`
      );
      totalDocsUpdated += colUpdated;
    }

    if (!dryRun) await flushBatch();

    console.log(
      `\nDone. ${dryRun ? "Would update" : "Updated"} ${totalDocsUpdated} document(s) across scanned collections.`
    );
  } finally {
    await deleteApp(app).catch(() => undefined);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
