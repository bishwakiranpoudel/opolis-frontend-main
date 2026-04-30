import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import { createBlogPostInFirestore } from "@/lib/create-content/blog-write";
import { getBlogCategoriesMapFromFirestore } from "@/lib/firestore-content";

export async function POST(request: Request) {
  const denied = authorizeCreate(request);
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
