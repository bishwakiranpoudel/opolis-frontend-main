import { revalidatePath } from "next/cache";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { STATE_FLOORS } from "@/lib/constants";
import { STATE_FLOOR_MAX } from "@/lib/state-floors-merge";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import { replaceStateFloorsDoc } from "@/lib/create-content/site-content-write";
import { getResolvedStateFloors } from "@/lib/firebase/site-content-read";
import { COLLECTIONS, STATE_FLOORS_DOC_ID } from "@/lib/firebase/schema";
import type { StateFloorsDoc } from "@/lib/firebase/types";

export async function GET(request: Request) {
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

  const merged = await getResolvedStateFloors();
  const db = getFirestore();
  const doc = await db
    .collection(COLLECTIONS.siteEligibility)
    .doc(STATE_FLOORS_DOC_ID)
    .get();
  const meta = doc.exists
    ? (doc.data() as Partial<StateFloorsDoc>)
    : undefined;

  return NextResponse.json({
    floors: merged,
    effectiveYear: meta?.effectiveYear ?? "",
    updatedAt: meta?.updatedAt ?? null,
    source: meta?.source ?? null,
    /** Canonical keys from code defaults (for validating CMS saves) */
  });
}

export async function PUT(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const rawFloors = b.floors;
  if (!rawFloors || typeof rawFloors !== "object") {
    return NextResponse.json({ error: "floors object required" }, { status: 400 });
  }

  const floors: Record<string, number> = {};
  for (const [k, v] of Object.entries(rawFloors)) {
    if (typeof v !== "number" || !Number.isFinite(v)) {
      return NextResponse.json(
        { error: `Invalid amount for "${k}"` },
        { status: 400 }
      );
    }
    const n = Math.round(v);
    if (n < 0 || n > STATE_FLOOR_MAX) {
      return NextResponse.json(
        {
          error: `Amount for "${k}" must be between 0 and ${STATE_FLOOR_MAX.toLocaleString()}.`,
        },
        { status: 400 }
      );
    }
    floors[k.trim()] = n;
  }

  const baseKeys = new Set(Object.keys(STATE_FLOORS));
  for (const k of Object.keys(floors)) {
    if (!baseKeys.has(k)) {
      return NextResponse.json(
        {
          error: `Unknown state key "${k}". Use exact labels from the static list.`,
        },
        { status: 400 }
      );
    }
  }
  for (const k of baseKeys) {
    if (!(k in floors)) {
      return NextResponse.json(
        { error: `Missing amount for "${k}"` },
        { status: 400 }
      );
    }
  }

  const effectiveYear =
    typeof b.effectiveYear === "string" ? b.effectiveYear : "";

  try {
    await replaceStateFloorsDoc({ floors, effectiveYear });
    revalidatePath("/eligibility");
    revalidatePath("/join");
    const merged = await getResolvedStateFloors();
    return NextResponse.json({ ok: true, floors: merged });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
