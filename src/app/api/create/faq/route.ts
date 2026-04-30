import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import { mergeFaqIntoFirestore } from "@/lib/create-content/merge-resources";
import type { FaqItem, FaqSection } from "@/lib/resourcesData";

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
  const mode = b.mode;

  try {
    if (mode === "append_section") {
      const section = b.section as FaqSection | undefined;
      if (!section?.id || !section.label || !Array.isArray(section.items)) {
        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
      }
      const items: FaqItem[] = [];
      for (const it of section.items) {
        if (!it || typeof it !== "object") continue;
        const o = it as Record<string, unknown>;
        if (typeof o.q === "string" && typeof o.a === "string") {
          items.push({ q: o.q.trim(), a: o.a.trim() });
        }
      }
      if (items.length === 0) {
        return NextResponse.json(
          { error: "Section must include at least one Q&A" },
          { status: 400 }
        );
      }
      await mergeFaqIntoFirestore("append_section", {
        section: {
          id: section.id.trim(),
          label: section.label.trim(),
          items,
        },
      });
    } else if (mode === "append_items") {
      const sectionId =
        typeof b.sectionId === "string" ? b.sectionId.trim() : "";
      const rawItems = b.items;
      if (!sectionId || !Array.isArray(rawItems)) {
        return NextResponse.json(
          { error: "sectionId and items[] required" },
          { status: 400 }
        );
      }
      const items: FaqItem[] = [];
      for (const it of rawItems) {
        if (!it || typeof it !== "object") continue;
        const o = it as Record<string, unknown>;
        if (typeof o.q === "string" && typeof o.a === "string") {
          items.push({ q: o.q.trim(), a: o.a.trim() });
        }
      }
      if (items.length === 0) {
        return NextResponse.json(
          { error: "At least one valid Q&A item required" },
          { status: 400 }
        );
      }
      await mergeFaqIntoFirestore("append_items", { sectionId, items });
    } else {
      return NextResponse.json(
        { error: "mode must be append_section or append_items" },
        { status: 400 }
      );
    }

    revalidatePath("/resources");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status = message.includes("not found") || message.includes("already") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
