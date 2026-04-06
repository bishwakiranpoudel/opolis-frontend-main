/**
 * Verify Firebase Admin can write to Firestore. Run before import-posts.
 * Usage: npx tsx scripts/wp-import/preflight-firestore.ts
 */
import "./config";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";

async function main() {
  getFirebaseAdmin();
  const db = getFirestore();
  await db.collection("_migration").doc("preflight").set({
    ok: true,
    at: new Date().toISOString(),
  });
  console.log("Firestore OK: wrote _migration/preflight");
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: number }).code;
  console.error(msg);
  if (code === 5 || msg.includes("NOT_FOUND")) {
    console.error(`
Firestore is not available for this project (NOT_FOUND).

Fix (one-time, ~2 minutes):
1. Open: https://console.firebase.google.com/project/opollis-2f950/firestore
2. Click "Create database"
3. Choose production mode (or test mode for dev), pick a region, enable.

Then run: npm run wp:import-posts
`);
  }
  process.exit(1);
});
