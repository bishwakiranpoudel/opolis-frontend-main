/**
 * Copy Firestore + Cloud Storage from a source Firebase project to a destination project.
 * Source is read-only (no deletes or writes). Destination receives upserts (same paths / ids).
 *
 * Default credential paths (repo root):
 *   firebase-adminsdk.json — source (old)
 *   production.json — destination (new)
 *
 * Usage:
 *   npx tsx scripts/firebase-project-migrate.ts --dry-run
 *   npx tsx scripts/firebase-project-migrate.ts --yes
 *   npx tsx scripts/firebase-project-migrate.ts --firestore-only --yes
 *   npx tsx scripts/firebase-project-migrate.ts --storage-only --yes
 *
 * Env overrides:
 *   MIGRATE_SOURCE_CREDENTIALS, MIGRATE_DEST_CREDENTIALS — paths to service account JSON
 *   MIGRATE_SOURCE_BUCKET, MIGRATE_DEST_BUCKET — optional
 *   Defaults: PROJECT_ID.firebasestorage.app (current Firebase default bucket name).
 *   Source also picks up FIREBASE_STORAGE_BUCKET / NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET from .env.local.
 */
import fs from "node:fs";
import path from "node:path";
import * as readline from "node:readline";
import { pipeline } from "node:stream/promises";
import type { File as GcsFile } from "@google-cloud/storage";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: path.resolve(process.cwd(), ".env.local") });
loadDotenv({ path: path.resolve(process.cwd(), ".env") });
import type { ServiceAccount } from "firebase-admin";
import { cert, deleteApp, initializeApp, type App } from "firebase-admin/app";
import {
  FieldPath,
  getFirestore,
  type CollectionReference,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const argv = new Set(process.argv.slice(2));
const dryRun = argv.has("--dry-run");
const storageOnly = argv.has("--storage-only");
const firestoreOnly = argv.has("--firestore-only");
const skipConfirm = argv.has("--yes");

const SOURCE_CRED =
  process.env.MIGRATE_SOURCE_CREDENTIALS || "firebase-adminsdk.json";
const DEST_CRED =
  process.env.MIGRATE_DEST_CREDENTIALS || "production.json";

function resolvePath(p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
}

function loadServiceAccount(
  filePath: string
): Record<string, unknown> & { project_id?: string; projectId?: string } {
  const raw = fs.readFileSync(resolvePath(filePath), "utf8");
  return JSON.parse(raw) as Record<string, unknown> & {
    project_id?: string;
    projectId?: string;
  };
}

function projectIdFromCred(
  cred: Record<string, unknown> & { project_id?: string; projectId?: string }
): string {
  const id =
    (typeof cred.project_id === "string" && cred.project_id) ||
    (typeof cred.projectId === "string" && cred.projectId) ||
    "";
  if (!id) throw new Error("Service account JSON missing project_id");
  return id;
}

/** Default GCS bucket name for Firebase Storage (replaces older PROJECT.appspot.com on many projects). */
function defaultBucket(projectId: string): string {
  return `${projectId}.firebasestorage.app`;
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

let docCount = 0;
let storageCount = 0;

/**
 * Cross-project bucket copy: `File#copy` authenticates as the source SA only and needs
 * create permission on the destination bucket. Using source read stream + dest write
 * stream keeps source SA read-only on dest while destination SA performs writes.
 */
async function streamCopyObject(src: GcsFile, dest: GcsFile): Promise<void> {
  const [meta] = await src.getMetadata();
  await pipeline(
    src.createReadStream(),
    dest.createWriteStream({
      metadata: {
        contentType: meta.contentType,
        cacheControl: meta.cacheControl,
        contentDisposition: meta.contentDisposition,
        contentEncoding: meta.contentEncoding,
        contentLanguage: meta.contentLanguage,
        metadata: meta.metadata,
      },
    })
  );
}

async function migrateCollectionPair(
  sourceCol: CollectionReference,
  destCol: CollectionReference,
  destDb: Firestore,
  dry: boolean
): Promise<void> {
  const pageSize = 400;
  let lastDoc: QueryDocumentSnapshot | undefined;

  for (;;) {
    let q = sourceCol.orderBy(FieldPath.documentId()).limit(pageSize);
    if (lastDoc) q = q.startAfter(lastDoc);
    const snap = await q.get();
    if (snap.empty) break;

    if (!dry) {
      const batch = destDb.batch();
      for (const doc of snap.docs) {
        batch.set(destCol.doc(doc.id), doc.data() ?? {});
      }
      await batch.commit();
    }
    docCount += snap.docs.length;

    for (const doc of snap.docs) {
      const subs = await doc.ref.listCollections();
      for (const sub of subs) {
        await migrateCollectionPair(
          sub,
          destCol.doc(doc.id).collection(sub.id),
          destDb,
          dry
        );
      }
    }

    lastDoc = snap.docs[snap.docs.length - 1];
    if (snap.size < pageSize) break;
  }
}

async function migrateAllFirestore(
  sourceDb: Firestore,
  destDb: Firestore,
  dry: boolean
): Promise<void> {
  docCount = 0;
  const roots = await sourceDb.listCollections();
  console.log(`Firestore: found ${roots.length} root collection(s).`);
  for (const col of roots) {
    console.log(`  → collection /${col.id}`);
    await migrateCollectionPair(col, destDb.collection(col.id), destDb, dry);
    console.log(`    done /${col.id}`);
  }
  console.log(
    dry
      ? `[dry-run] Firestore: would copy ${docCount} document(s) (incl. nested).`
      : `Firestore: copied ${docCount} document(s) (incl. nested).`
  );
}

async function migrateStorageBuckets(
  sourceBucketName: string,
  destBucketName: string,
  sourceApp: App,
  destApp: App,
  dry: boolean
): Promise<void> {
  storageCount = 0;
  const sourceBucket = getStorage(sourceApp).bucket(sourceBucketName);
  const destBucket = getStorage(destApp).bucket(destBucketName);

  let query: Record<string, unknown> = {
    autoPaginate: false,
    maxResults: 500,
  };
  for (;;) {
    const [files, nextQuery] = await sourceBucket.getFiles(query);
    for (const file of files) {
      const name = file.name;
      if (name.endsWith("/")) continue;

      if (!dry) {
        const destFile = destBucket.file(name);
        await streamCopyObject(file, destFile);
      }
      storageCount++;
      if (storageCount % 200 === 0) {
        console.log(`  Storage: ${dry ? "counted" : "copied"} ${storageCount} object(s)...`);
      }
    }
    if (!nextQuery || Object.keys(nextQuery).length === 0) break;
    query = { ...nextQuery, autoPaginate: false, maxResults: 500 };
  }

  console.log(
    dry
      ? `[dry-run] Storage: would copy ${storageCount} object(s) from gs://${sourceBucketName} → gs://${destBucketName}.`
      : `Storage: copied ${storageCount} object(s) to gs://${destBucketName}.`
  );
}

async function main(): Promise<void> {
  const sourceCred = loadServiceAccount(SOURCE_CRED);
  const destCred = loadServiceAccount(DEST_CRED);
  const sourceProjectId = projectIdFromCred(sourceCred);
  const destProjectId = projectIdFromCred(destCred);

  const sourceBucketName =
    process.env.MIGRATE_SOURCE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    defaultBucket(sourceProjectId);
  const destBucketName =
    process.env.MIGRATE_DEST_BUCKET ||
    defaultBucket(destProjectId);

  console.log("Firebase migration");
  console.log(`  Source project: ${sourceProjectId} (read-only)`);
  console.log(`  Dest project:   ${destProjectId} (writes)`);
  console.log(`  Source bucket:  ${sourceBucketName}`);
  console.log(`  Dest bucket:    ${destBucketName}`);
  console.log(`  Dry run:        ${dryRun}`);

  if (!dryRun && !skipConfirm) {
    const ok = await promptYes(
      "Writes go to the DESTINATION project only. Source is not modified. Type yes to continue: "
    );
    if (!ok) {
      console.log("Aborted.");
      process.exit(1);
    }
  }

  const sourceApp = initializeApp(
    {
      credential: cert(sourceCred as ServiceAccount),
      projectId: sourceProjectId,
      storageBucket: sourceBucketName,
    },
    "migrate-source"
  );

  const destApp = initializeApp(
    {
      credential: cert(destCred as ServiceAccount),
      projectId: destProjectId,
      storageBucket: destBucketName,
    },
    "migrate-dest"
  );

  try {
    if (!storageOnly) {
      const sourceDb = getFirestore(sourceApp);
      const destDb = getFirestore(destApp);
      await migrateAllFirestore(sourceDb, destDb, dryRun);
    }

    if (!firestoreOnly) {
      await migrateStorageBuckets(
        sourceBucketName,
        destBucketName,
        sourceApp,
        destApp,
        dryRun
      );
    }

    console.log(dryRun ? "\nDry run finished." : "\nMigration finished.");
  } finally {
    await deleteApp(sourceApp).catch(() => undefined);
    await deleteApp(destApp).catch(() => undefined);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
