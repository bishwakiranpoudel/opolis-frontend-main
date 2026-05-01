import { revalidatePath } from "next/cache";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { authorizeCreate } from "@/lib/create-content/auth";
import {
  createPodcastEpisodeInFirestore,
  deletePodcastEpisodeFromFirestore,
  updatePodcastEpisodeInFirestore,
} from "@/lib/create-content/podcast-write";
import { COLLECTIONS } from "@/lib/firebase/schema";
import type { PodcastEpisodeDoc } from "@/lib/firebase/types";
import {
  getPodcastEpisodesFromFirestore,
} from "@/lib/firestore-content";
import type { PodcastSeriesKey } from "@/lib/podcastTypes";

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

const SERIES_KEYS = new Set<PodcastSeriesKey>([
  "opolis-public-radio",
  "unemployable",
  "unknown",
]);

function parseSeriesKey(raw: unknown): PodcastSeriesKey {
  if (typeof raw === "string" && SERIES_KEYS.has(raw as PodcastSeriesKey)) {
    return raw as PodcastSeriesKey;
  }
  return "unemployable";
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
      const snap = await db.collection(COLLECTIONS.podcastEpisodes).doc(slug).get();
      if (!snap.exists) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ episode: snap.data() as PodcastEpisodeDoc });
    }
    const episodes = await getPodcastEpisodesFromFirestore();
    return NextResponse.json({
      episodes: episodes.map((e) => ({
        slug: e.slug,
        title: e.title,
        dateIso: e.dateIso,
        seriesKey: e.seriesKey,
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Read failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
  const slug = typeof b.slug === "string" ? b.slug : undefined;
  const title = typeof b.title === "string" ? b.title : "";
  const excerptHtml = typeof b.excerptHtml === "string" ? b.excerptHtml : "";
  const contentHtml = typeof b.contentHtml === "string" ? b.contentHtml : "";
  const dateIso = typeof b.dateIso === "string" ? b.dateIso : undefined;
  const youtubeVideoId =
    typeof b.youtubeVideoId === "string" ? b.youtubeVideoId : undefined;
  const thumbnailUrl =
    typeof b.thumbnailUrl === "string" ? b.thumbnailUrl : undefined;
  const seriesKey = parseSeriesKey(b.seriesKey);

  try {
    const result = await createPodcastEpisodeInFirestore({
      slug,
      title,
      excerptHtml,
      contentHtml,
      dateIso,
      seriesKey,
      youtubeVideoId,
      thumbnailUrl,
    });
    revalidatePath("/resources/podcasts");
    revalidatePath(`/resources/podcasts/${result.slug}`);
    return NextResponse.json({ ok: true, slug: result.slug });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Write failed";
    const status =
      message.includes("already exists") || message.includes("Invalid") || message.includes("required")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
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
  const excerptHtml = typeof b.excerptHtml === "string" ? b.excerptHtml : "";
  const contentHtml = typeof b.contentHtml === "string" ? b.contentHtml : "";
  const dateIso = typeof b.dateIso === "string" ? b.dateIso : undefined;
  const youtubeVideoId =
    typeof b.youtubeVideoId === "string" ? b.youtubeVideoId : undefined;
  const thumbnailUrl =
    typeof b.thumbnailUrl === "string" ? b.thumbnailUrl : undefined;
  const seriesKey = parseSeriesKey(b.seriesKey);

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  try {
    const result = await updatePodcastEpisodeInFirestore(slug, {
      title,
      excerptHtml,
      contentHtml,
      dateIso,
      seriesKey,
      youtubeVideoId,
      thumbnailUrl,
    });
    revalidatePath("/resources/podcasts");
    revalidatePath(`/resources/podcasts/${result.slug}`);
    return NextResponse.json({ ok: true, slug: result.slug });
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
    await deletePodcastEpisodeFromFirestore(slug);
    revalidatePath("/resources/podcasts");
    revalidatePath(`/resources/podcasts/${slug}`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Delete failed";
    return NextResponse.json(
      { error: message },
      { status: message.includes("not found") ? 404 : 500 }
    );
  }
}
