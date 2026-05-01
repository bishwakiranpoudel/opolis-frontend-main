import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import {
  deleteGuidesItem,
  deleteGuidesSection,
  mergeGuidesIntoFirestore,
  replaceAllGuidesSections,
  updateGuidesSection,
} from "@/lib/create-content/merge-resources";
import type { GuidesSection } from "@/lib/resourcesData";

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
      const section = b.section as GuidesSection | undefined;
      if (!section?.cat || !section.cc || !Array.isArray(section.items)) {
        return NextResponse.json({ error: "Invalid section" }, { status: 400 });
      }
      const items: GuidesSection["items"] = [];
      for (const it of section.items) {
        if (!it || typeof it !== "object") continue;
        const o = it as Record<string, unknown>;
        if (
          typeof o.type === "string" &&
          typeof o.label === "string" &&
          typeof o.url === "string"
        ) {
          items.push({
            type: o.type.trim(),
            label: o.label.trim(),
            url: o.url.trim(),
          });
        }
      }
      if (items.length === 0) {
        return NextResponse.json(
          { error: "Section must include at least one link row" },
          { status: 400 }
        );
      }
      await mergeGuidesIntoFirestore("append_section", {
        section: {
          cat: section.cat.trim(),
          cc: section.cc.trim(),
          items,
        },
      });
    } else if (mode === "append_items") {
      const sectionIndex = Number(b.sectionIndex);
      const rawItems = b.items;
      if (!Number.isInteger(sectionIndex) || !Array.isArray(rawItems)) {
        return NextResponse.json(
          { error: "sectionIndex (integer) and items[] required" },
          { status: 400 }
        );
      }
      const items: GuidesSection["items"] = [];
      for (const it of rawItems) {
        if (!it || typeof it !== "object") continue;
        const o = it as Record<string, unknown>;
        if (
          typeof o.type === "string" &&
          typeof o.label === "string" &&
          typeof o.url === "string"
        ) {
          items.push({
            type: o.type.trim(),
            label: o.label.trim(),
            url: o.url.trim(),
          });
        }
      }
      if (items.length === 0) {
        return NextResponse.json(
          { error: "At least one valid row required" },
          { status: 400 }
        );
      }
      await mergeGuidesIntoFirestore("append_items", { sectionIndex, items });
    } else if (mode === "replace_all") {
      const raw = b.guides;
      if (!Array.isArray(raw)) {
        return NextResponse.json({ error: "guides[] required" }, { status: 400 });
      }
      const sections: GuidesSection[] = [];
      for (const sec of raw) {
        if (!sec || typeof sec !== "object") continue;
        const s = sec as Record<string, unknown>;
        if (typeof s.cat !== "string" || typeof s.cc !== "string") continue;
        const items: GuidesSection["items"] = [];
        if (Array.isArray(s.items)) {
          for (const it of s.items) {
            if (!it || typeof it !== "object") continue;
            const o = it as Record<string, unknown>;
            if (
              typeof o.type === "string" &&
              typeof o.label === "string" &&
              typeof o.url === "string"
            ) {
              items.push({
                type: o.type.trim(),
                label: o.label.trim(),
                url: o.url.trim(),
              });
            }
          }
        }
        if (items.length > 0) {
          sections.push({ cat: s.cat.trim(), cc: s.cc.trim(), items });
        }
      }
      await replaceAllGuidesSections(sections);
    } else if (mode === "delete_section") {
      const sectionIndex = Number(b.sectionIndex);
      if (!Number.isInteger(sectionIndex)) {
        return NextResponse.json(
          { error: "sectionIndex (integer) required" },
          { status: 400 }
        );
      }
      await deleteGuidesSection(sectionIndex);
    } else if (mode === "update_section") {
      const sectionIndex = Number(b.sectionIndex);
      const section = b.section as GuidesSection | undefined;
      if (!Number.isInteger(sectionIndex) || !section?.cat || !section.cc) {
        return NextResponse.json(
          { error: "sectionIndex and section required" },
          { status: 400 }
        );
      }
      const items: GuidesSection["items"] = [];
      if (Array.isArray(section.items)) {
        for (const it of section.items) {
          if (!it || typeof it !== "object") continue;
          const o = it as Record<string, unknown>;
          if (
            typeof o.type === "string" &&
            typeof o.label === "string" &&
            typeof o.url === "string"
          ) {
            items.push({
              type: o.type.trim(),
              label: o.label.trim(),
              url: o.url.trim(),
            });
          }
        }
      }
      if (items.length === 0) {
        return NextResponse.json(
          { error: "Section must include at least one link row" },
          { status: 400 }
        );
      }
      await updateGuidesSection(sectionIndex, {
        cat: section.cat.trim(),
        cc: section.cc.trim(),
        items,
      });
    } else if (mode === "delete_item") {
      const sectionIndex = Number(b.sectionIndex);
      const itemIndex = Number(b.itemIndex);
      if (!Number.isInteger(sectionIndex) || !Number.isInteger(itemIndex)) {
        return NextResponse.json(
          { error: "sectionIndex and itemIndex (integers) required" },
          { status: 400 }
        );
      }
      await deleteGuidesItem(sectionIndex, itemIndex);
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
    revalidatePath("/resources/guides");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status =
      message.includes("not found") ||
      message.includes("Invalid") ||
      message.includes("index")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
