import fs from "node:fs";
import path from "node:path";
import * as admin from "firebase-admin";

let app: admin.app.App | undefined;

function resolveCredentialPath(raw: string): string {
  return path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
}

/**
 * Firebase Admin for server-side Next.js and CLI scripts.
 * Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the full JSON string, or use
 * `GOOGLE_APPLICATION_CREDENTIALS` pointing at a service account file.
 */
export function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const bucket =
    process.env.FIREBASE_STORAGE_BUCKET ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const cred = JSON.parse(json) as admin.ServiceAccount;
    app = admin.initializeApp({
      credential: admin.credential.cert(cred),
      projectId: cred.projectId || process.env.FIREBASE_PROJECT_ID,
      storageBucket: bucket || undefined,
    });
    return app;
  }

  const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (gac) {
    const filePath = resolveCredentialPath(gac);
    const raw = fs.readFileSync(filePath, "utf8");
    const cred = JSON.parse(raw) as admin.ServiceAccount & { project_id?: string };
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      cred.projectId ||
      cred.project_id ||
      undefined;
    app = admin.initializeApp({
      credential: admin.credential.cert(cred as admin.ServiceAccount),
      projectId,
      storageBucket: bucket || undefined,
    });
    return app;
  }

  throw new Error(
    "Firebase Admin: set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS"
  );
}
