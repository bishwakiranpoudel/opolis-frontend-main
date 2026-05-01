import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import {
  deleteFaqItem,
  deleteFaqSection,
  mergeFaqIntoFirestore,
  replaceAllFaqSections,
  updateFaqSection,
} from "@/lib/create-content/merge-resources";
import type { FaqItem, FaqSection } from "@/lib/resourcesData";

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
    } else if (mode === "replace_all") {
      const raw = b.faq;
      if (!Array.isArray(raw)) {
        return NextResponse.json({ error: "faq[] required" }, { status: 400 });
      }
      const sections: FaqSection[] = [];
      for (const sec of raw) {
        if (!sec || typeof sec !== "object") continue;
        const s = sec as Record<string, unknown>;
        if (typeof s.id !== "string" || typeof s.label !== "string") continue;
        const items: FaqItem[] = [];
        if (Array.isArray(s.items)) {
          for (const it of s.items) {
            if (!it || typeof it !== "object") continue;
            const o = it as Record<string, unknown>;
            if (typeof o.q === "string" && typeof o.a === "string") {
              items.push({ q: o.q.trim(), a: o.a.trim() });
            }
          }
        }
        if (items.length > 0) {
          sections.push({
            id: s.id.trim(),
            label: s.label.trim(),
            items,
          });
        }
      }
      await replaceAllFaqSections(sections);
    } else if (mode === "delete_section") {
      const sectionId =
        typeof b.sectionId === "string" ? b.sectionId.trim() : "";
      if (!sectionId) {
        return NextResponse.json({ error: "sectionId required" }, { status: 400 });
      }
      await deleteFaqSection(sectionId);
    } else if (mode === "update_section") {
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
      await updateFaqSection({
        id: section.id.trim(),
        label: section.label.trim(),
        items,
      });
    } else if (mode === "delete_item") {
      const sectionId =
        typeof b.sectionId === "string" ? b.sectionId.trim() : "";
      const itemIndex = Number(b.itemIndex);
      if (!sectionId || !Number.isInteger(itemIndex)) {
        return NextResponse.json(
          { error: "sectionId and integer itemIndex required" },
          { status: 400 }
        );
      }
      await deleteFaqItem(sectionId, itemIndex);
    } else {
      return NextResponse.json(
        {
          error:
            "mode must be append_section, append_items, replace_all, delete_section, update_section, or delete_item",
        },
        { status: 400 }
      );
    }

    revalidatePath("/resources");
    revalidatePath("/resources/faq");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status = message.includes("not found") || message.includes("already") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
