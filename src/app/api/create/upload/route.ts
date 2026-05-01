import { getStorage } from "firebase-admin/storage";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { gcsPublicObjectUrl } from "@/lib/firebase/storage-public-url";
import { authorizeCreate } from "@/lib/create-content/auth";

const MAX_BYTES = 12 * 1024 * 1024;

const ALLOWED_PREFIX = /^image\/|^application\/pdf$/;

/** IAM-based signing often caps V4 signed URLs at 7 days; avoid long expiries. */
const SIGNED_URL_MAX_MS = 6 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const denied = await authorizeCreate(request);
  if (denied) return denied;

  try {
    getFirebaseAdmin();
  } catch {
    return NextResponse.json(
      { error: "Firebase Admin is not configured on this server." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_BYTES / 1024 / 1024}MB)` },
      { status: 400 }
    );
  }

  const mime = file.type || "application/octet-stream";
  if (!ALLOWED_PREFIX.test(mime)) {
    return NextResponse.json(
      { error: "Only images and PDF uploads are allowed" },
      { status: 400 }
    );
  }

  const safeBase = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
  const objectPath = `cms-uploads/${Date.now()}-${safeBase}`;

  try {
    const bucket = getStorage().bucket();
    const buffer = Buffer.from(await file.arrayBuffer());
    const gcsFile = bucket.file(objectPath);
    await gcsFile.save(buffer, {
      metadata: {
        contentType: mime,
        cacheControl: "public, max-age=31536000",
      },
    });

    const bucketName = bucket.name;

    let url: string;
    try {
      await gcsFile.makePublic();
      /** Direct GCS URL so anonymous readers are not blocked by Firebase Storage Rules. */
      url = gcsPublicObjectUrl(bucketName, objectPath);
    } catch {
      const expires = new Date(Date.now() + SIGNED_URL_MAX_MS);
      const [signedUrl] = await gcsFile.getSignedUrl({
        version: "v4",
        action: "read",
        expires,
      });
      url = signedUrl;
    }

    return NextResponse.json({
      url,
      storagePath: objectPath,
      contentType: mime,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
