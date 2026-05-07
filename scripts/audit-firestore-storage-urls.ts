/**
 * Read-only scan of Firestore string fields for Firebase / GCS URLs and report
 * which bucket ids appear. Use after migration to see if legacy buckets remain.
 *
 *   npx tsx scripts/audit-firestore-storage-urls.ts
 *
 * Env:
 *   AUDIT_FIRESTORE_CREDENTIALS — service account path (default: production.json)
 */
import fs from "node:fs";
import path from "node:path";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), ".env") });

import type { ServiceAccount } from "firebase-admin";
import { cert, deleteApp, getApps, initializeApp } from "firebase-admin/app";
import {
  DocumentReference,
  GeoPoint,
  Timestamp,
  getFirestore,
} from "firebase-admin/firestore";
import { COLLECTIONS } from "../src/lib/firebase/schema";

const APP_NAME = "audit-firestore-storage-urls";

const CRED_PATH =
  process.env.AUDIT_FIRESTORE_CREDENTIALS ||
  process.env.REWRITE_FIRESTORE_CREDENTIALS ||
  path.resolve(process.cwd(), "production.json");

const URL_PATTERN =
  /https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/([^/]+)\/o\/|https:\/\/storage\.googleapis\.com\/([^/\s"'<>]+)\/|gs:\/\/([^/\s"'<>]+)\//gi;

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

function collectBucketsFromString(s: string, into: Map<string, number>): void {
  URL_PATTERN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = URL_PATTERN.exec(s)) !== null) {
    const b = m[1] || m[2] || m[3];
    if (b) into.set(b, (into.get(b) ?? 0) + 1);
  }
}

function walk(value: unknown, into: Map<string, number>): void {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    collectBucketsFromString(value, into);
    return;
  }
  if (typeof value !== "object") return;
  if (
    value instanceof Timestamp ||
    value instanceof GeoPoint ||
    value instanceof DocumentReference
  ) {
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) walk(v, into);
    return;
  }
  for (const v of Object.values(value as Record<string, unknown>)) {
    walk(v, into);
  }
}

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

  console.log("Firestore Storage URL audit (read-only)");
  console.log(`  Credential file: ${CRED_PATH}`);
  console.log(`  Project:         ${projectId}\n`);

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
  const buckets = new Map<string, number>();

  try {
    for (const collectionId of COLLECTIONS_TO_SCAN) {
      const snap = await db.collection(collectionId).get();
      for (const doc of snap.docs) {
        const raw = doc.data();
        if (!raw) continue;
        walk(raw, buckets);
      }
      console.log(`Scanned ${collectionId}: ${snap.size} document(s)`);
    }

    console.log("\nBucket ids seen in URL strings (occurrence count):");
    const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      console.log("  (none — no matching URLs found)");
    } else {
      for (const [id, n] of sorted) {
        console.log(`  ${id}  →  ${n}`);
      }
    }

    const expected =
      process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ||
      `${projectId}.firebasestorage.app`;
    console.log(`\nExpected production bucket (from env or project): ${expected}`);
    const unexpected = sorted.filter(([id]) => id !== expected);
    if (unexpected.length > 0) {
      console.log(
        "\nNon-target buckets still referenced — run scripts/firestore-rewrite-storage-buckets.ts --yes"
      );
      console.log(
        "or rely on runtime remap in storage-bucket-remap.ts (defaults apply when STORAGE_URL_BUCKET_LEGACY_LIST is unset)."
      );
    }
  } finally {
    await deleteApp(app).catch(() => undefined);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
