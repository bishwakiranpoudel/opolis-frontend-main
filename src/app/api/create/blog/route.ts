import { revalidatePath } from "next/cache";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import {
  createBlogPostInFirestore,
  deleteBlogPostFromFirestore,
  updateBlogPostInFirestore,
} from "@/lib/create-content/blog-write";
import { COLLECTIONS } from "@/lib/firebase/schema";
import type { BlogPostDoc } from "@/lib/firebase/types";
import {
  getBlogCategoriesMapFromFirestore,
  getBlogPostsFromFirestore,
} from "@/lib/firestore-content";

function adminOr503() {
  try {
    getFirebaseAdmin();
    return null;
  } catch {
    return NextResponse.json(
      { error: "Firebase Admin is not configured on this server." },
      { status: 503 }
    );
  }
}

export async function GET(request: Request) {
  const denied = await authorizeCreate(request);
  if (denied) return denied;

  const err = adminOr503();
  if (err) return err;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();
  try {
    if (slug) {
      const db = getFirestore();
      const snap = await db.collection(COLLECTIONS.blogPosts).doc(slug).get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ post: snap.data() as BlogPostDoc });
    }
    const posts = await getBlogPostsFromFirestore();
    return NextResponse.json({
      posts: posts.map((p) => ({
        slug: p.slug,
        title: p.h,
        dateIso: p.dateIso,
        categorySlug: p.categorySlug,
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Read failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const denied = await authorizeCreate(request);
  if (denied) return denied;

  const err = adminOr503();
  if (err) return err;

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
  const slug =
    typeof b.slug === "string" ? b.slug.trim().toLowerCase() : "";
  const title = typeof b.title === "string" ? b.title : "";
  const categoryWpId =
    typeof b.categoryWpId === "number"
      ? b.categoryWpId
      : typeof b.categoryWpId === "string"
        ? parseInt(b.categoryWpId, 10)
        : NaN;
  const excerptHtml = typeof b.excerptHtml === "string" ? b.excerptHtml : "";
  const contentHtml = typeof b.contentHtml === "string" ? b.contentHtml : "";
  const dateIso = typeof b.dateIso === "string" ? b.dateIso : undefined;
  const featuredImageUrl =
    typeof b.featuredImageUrl === "string" ? b.featuredImageUrl : undefined;

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  try {
    const categoriesMap = await getBlogCategoriesMapFromFirestore();
    const result = await updateBlogPostInFirestore(
      slug,
      {
        title,
        categoryWpId,
        excerptHtml,
        contentHtml,
        dateIso,
        featuredImageUrl,
      },
      categoriesMap
    );
    revalidatePath("/resources/blog");
    revalidatePath(`/resources/blog/${result.categorySlug}/${result.slug}`);
    return NextResponse.json({
      ok: true,
      slug: result.slug,
      categorySlug: result.categorySlug,
      path: result.path,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status =
      message.includes("not found") || message.includes("Invalid") || message.includes("required")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  const denied = await authorizeCreate(request);
  if (denied) return denied;

  const err = adminOr503();
  if (err) return err;

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug query required" }, { status: 400 });
  }

  try {
    const categoriesMap = await getBlogCategoriesMapFromFirestore();
    const db = getFirestore();
    const snap = await db.collection(COLLECTIONS.blogPosts).doc(slug).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const d = snap.data() as BlogPostDoc;
    const firstId = d.categoryIds?.[0];
    const catSlug =
      firstId != null
        ? categoriesMap.get(firstId)?.slug
        : undefined;

    await deleteBlogPostFromFirestore(slug);
    revalidatePath("/resources/blog");
    if (catSlug) {
      revalidatePath(`/resources/blog/${catSlug}/${slug}`);
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json(
      { error: message },
      { status: message.includes("not found") ? 404 : 500 }
    );
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
  const title = typeof b.title === "string" ? b.title : "";
  const slug = typeof b.slug === "string" ? b.slug : undefined;
  const categoryWpId =
    typeof b.categoryWpId === "number"
      ? b.categoryWpId
      : typeof b.categoryWpId === "string"
        ? parseInt(b.categoryWpId, 10)
        : NaN;
  const excerptHtml = typeof b.excerptHtml === "string" ? b.excerptHtml : "";
  const contentHtml = typeof b.contentHtml === "string" ? b.contentHtml : "";
  const dateIso = typeof b.dateIso === "string" ? b.dateIso : undefined;
  const featuredImageUrl =
    typeof b.featuredImageUrl === "string" ? b.featuredImageUrl : undefined;

  try {
    const categoriesMap = await getBlogCategoriesMapFromFirestore();
    const result = await createBlogPostInFirestore(
      {
        title,
        slug,
        categoryWpId,
        excerptHtml,
        contentHtml,
        dateIso,
        featuredImageUrl,
      },
      categoriesMap
    );
    revalidatePath("/resources/blog");
    revalidatePath(`/resources/blog/${result.categorySlug}/${result.slug}`);
    return NextResponse.json({
      ok: true,
      slug: result.slug,
      categorySlug: result.categorySlug,
      path: result.path,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status =
      message.includes("already exists") || message.includes("Invalid")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
