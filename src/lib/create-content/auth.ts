/**
 * CMS API authorization:
 * - Firebase ID token (Authorization: Bearer <JWT>) — verified with Admin SDK
 * - Optional legacy shared secret (CREATE_CONTENT_SECRET) for scripts/automation
 * - Optional CMS_ALLOWED_EMAILS (comma-separated): restrict Firebase users by email
 */

import { getAuth } from "firebase-admin/auth";
import { getFirebaseAdmin } from "@/lib/firebase/admin";

export function getCreateContentSecret(): string | null {
  const s = process.env.CREATE_CONTENT_SECRET?.trim();
  return s && s.length >= 8 ? s : null;
}

function parseAllowedEmails(): Set<string> | null {
  const raw = process.env.CMS_ALLOWED_EMAILS?.trim();
  if (!raw) return null;
  const set = new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
  return set.size ? set : null;
}

function bearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    const t = auth.slice(7).trim();
    return t || null;
  }
  const alt = request.headers.get("x-create-content-token")?.trim();
  return alt || null;
}

/** Returns JSON Response if unauthorized / misconfigured; otherwise null. */
export async function authorizeCreate(
  request: Request
): Promise<Response | null> {
  const token = bearerToken(request);
  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = getCreateContentSecret();
  if (secret && token === secret) {
    return null;
  }

  try {
    getFirebaseAdmin();
  } catch {
    return Response.json(
      {
        error:
          "Server auth not configured. Set Firebase Admin credentials or CREATE_CONTENT_SECRET.",
      },
      { status: 503 }
    );
  }

  try {
    const decoded = await getAuth().verifyIdToken(token);
    const allowed = parseAllowedEmails();
    if (allowed) {
      const email = decoded.email?.toLowerCase();
      if (!email || !allowed.has(email)) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    return null;
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
}
