import { revalidatePath } from "next/cache";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import { normalizePeopleRow } from "@/lib/create-content/people-entry-normalize";
import { createPeopleEntry } from "@/lib/create-content/site-content-write";
import { COLLECTIONS } from "@/lib/firebase/schema";
import type { PeopleEntryDoc, PeopleSection } from "@/lib/firebase/types";

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

  const url = new URL(request.url);
  const section = url.searchParams.get("section") as PeopleSection | null;
  if (section !== "board" && section !== "team") {
    return NextResponse.json(
      { error: "Query param section=board|team required" },
      { status: 400 }
    );
  }

  const db = getFirestore();
  const snap = await db
    .collection(COLLECTIONS.peopleEntries)
    .where("section", "==", section)
    .get();
  const entries = snap.docs
    .map((d) =>
      normalizePeopleRow(d.id, d.data() as Record<string, unknown>, section)
    )
    .sort(
      (a, b) =>
        (typeof a.sortOrder === "number" ? a.sortOrder : 0) -
        (typeof b.sortOrder === "number" ? b.sortOrder : 0)
    );

  return NextResponse.json({ entries });
}

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const section = b.section as PeopleSection | undefined;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const title = typeof b.title === "string" ? b.title.trim() : "";
  const avatarUrl =
    typeof b.avatarUrl === "string" ? b.avatarUrl.trim() : "";
  if (section !== "board" && section !== "team") {
    return NextResponse.json(
      { error: "section must be board or team" },
      { status: 400 }
    );
  }
  if (!name || !title) {
    return NextResponse.json(
      { error: "name and title are required" },
      { status: 400 }
    );
  }

  let sortOrder =
    typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)
      ? Math.round(b.sortOrder)
      : NaN;
  if (!Number.isFinite(sortOrder)) {
    const db = getFirestore();
    const snap = await db
      .collection(COLLECTIONS.peopleEntries)
      .where("section", "==", section)
      .get();
    let max = -1;
    for (const doc of snap.docs) {
      const so = (doc.data() as PeopleEntryDoc).sortOrder;
      if (typeof so === "number" && so > max) max = so;
    }
    sortOrder = max + 1;
  }

  try {
    const id = await createPeopleEntry({
      section,
      name,
      title,
      avatarUrl: avatarUrl || undefined,
      sortOrder,
    });
    revalidatePath("/about");
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status =
      message.includes("required") || message.includes("empty") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
