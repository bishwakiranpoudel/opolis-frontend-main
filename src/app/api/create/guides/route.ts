import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import { mergeGuidesIntoFirestore } from "@/lib/create-content/merge-resources";
import type { GuidesSection } from "@/lib/resourcesData";

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
    const status =
      message.includes("not found") ||
      message.includes("Invalid") ||
      message.includes("index")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
