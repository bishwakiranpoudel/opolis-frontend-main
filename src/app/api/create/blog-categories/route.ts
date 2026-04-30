import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import { getBlogCategoriesMapFromFirestore } from "@/lib/firestore-content";

export async function GET(request: Request) {
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
