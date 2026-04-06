/**
 * Try to create the default Firestore database via REST (if missing).
 * Requires service account with permission to create databases.
 * Usage: npx tsx scripts/wp-import/ensure-firestore.ts
 */
import "./config";
import path from "node:path";
import { GoogleAuth } from "google-auth-library";

const PROJECT_ID = "opollis-2f950";
/** Good default; change if your org requires another region */
const LOCATION_ID = process.env.FIRESTORE_LOCATION_ID || "us-central1";

async function main() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!raw) {
    throw new Error("Set GOOGLE_APPLICATION_CREDENTIALS in .env.local");
  }
  const keyFile = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);

  const auth = new GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error("No access token");

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases?databaseId=%28default%29`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "FIRESTORE_NATIVE",
      locationId: LOCATION_ID,
    }),
  });

  const text = await res.text();
  console.log("HTTP", res.status, text.slice(0, 2000));

  if (res.ok || res.status === 409) {
    console.log(
      res.status === 409
        ? "Database already exists (409)."
        : "Create request accepted. If this returns a long-running operation, wait 1–2 minutes."
    );
    return;
  }

  if (res.status === 404 || res.status === 400) {
    console.error(
      "Automatic create failed. Create the database manually:\n" +
        `https://console.firebase.google.com/project/${PROJECT_ID}/firestore`
    );
  }
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
