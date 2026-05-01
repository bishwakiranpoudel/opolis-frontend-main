import { revalidatePath } from "next/cache";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { isValidBlogSlug } from "@/lib/create-content/blog-slug";
import { authorizeCreate } from "@/lib/create-content/auth";
import { COLLECTIONS } from "@/lib/firebase/schema";
import type { BlogCategoryDoc } from "@/lib/firebase/types";
import { getBlogCategoriesMapFromFirestore } from "@/lib/firestore-content";

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

  try {
    const map = await getBlogCategoriesMapFromFirestore();
    const categories = [...map.entries()].map(([wpId, v]) => ({
      wpId,
      name: v.name,
      slug: v.slug,
    }));
    categories.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json({ categories });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load categories";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const slug = typeof b.slug === "string" ? b.slug.trim().toLowerCase() : "";
  if (!name || !slug) {
    return NextResponse.json(
      { error: "name and slug are required" },
      { status: 400 }
    );
  }
  if (!isValidBlogSlug(slug)) {
    return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
  }

  try {
    const db = getFirestore();
    const snap = await db.collection(COLLECTIONS.blogCategories).get();
    let maxWp = 0;
    const slugs = new Set<string>();
    snap.forEach((doc) => {
      const d = doc.data() as BlogCategoryDoc;
      if (typeof d.wpId === "number" && d.wpId > maxWp) maxWp = d.wpId;
      if (d.slug) slugs.add(d.slug.toLowerCase());
    });
    if (slugs.has(slug)) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }
    const wpId = maxWp + 1;
    const ref = db.collection(COLLECTIONS.blogCategories).doc(String(wpId));
    const doc: BlogCategoryDoc = { wpId, name, slug };
    await ref.set(doc);
    revalidatePath("/resources/blog");
    return NextResponse.json({ ok: true, wpId, name, slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
  const wpIdRaw = url.searchParams.get("wpId");
  const wpId = wpIdRaw ? parseInt(wpIdRaw, 10) : NaN;
  if (!Number.isFinite(wpId)) {
    return NextResponse.json({ error: "wpId query required" }, { status: 400 });
  }

  try {
    const db = getFirestore();
    const ref = db.collection(COLLECTIONS.blogCategories).doc(String(wpId));
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await ref.delete();
    revalidatePath("/resources/blog");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
