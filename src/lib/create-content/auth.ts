/**
 * Server-side guard for CMS write APIs. Set CREATE_CONTENT_SECRET in the server env;
 * clients send Authorization: Bearer <secret> (or x-create-content-token).
 */

export function getCreateContentSecret(): string | null {
  const s = process.env.CREATE_CONTENT_SECRET?.trim();
  return s && s.length >= 8 ? s : null;
}

/** Returns JSON Response if unauthorized / misconfigured; otherwise null. */
export function authorizeCreate(request: Request): Response | null {
  const secret = getCreateContentSecret();
  if (!secret) {
    return Response.json(
      {
        error:
          "CREATE_CONTENT_SECRET is not set (min 8 characters). Configure it on the server.",
      },
      { status: 503 }
    );
  }
  const auth = request.headers.get("authorization");
  const fromHeader =
    auth?.startsWith("Bearer ") ? auth.slice(7).trim() : undefined;
  const fromAlt = request.headers.get("x-create-content-token")?.trim();
  const token = fromHeader || fromAlt;
  if (!token || token !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
