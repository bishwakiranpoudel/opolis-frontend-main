import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import { getFaqFromFirestore, getGuidesFromFirestore } from "@/lib/firestore-content";

/** Current FAQ + guides from Firestore (or fallbacks) for CMS forms. */
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
    const [faq, guides] = await Promise.all([
      getFaqFromFirestore(),
      getGuidesFromFirestore(),
    ]);
    return NextResponse.json({ faq, guides });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load resources";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
