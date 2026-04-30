import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { C } from "@/lib/constants";
import { extractYoutubeVideoId } from "@/lib/podcastTypes";
import { findGuideByParams } from "@/lib/guideItems";
import { getGuides } from "@/lib/wordpressResources";

type PageProps = { params: Promise<{ type: string; slug: string }> };

export const dynamic = "force-dynamic";

function extractYoutubeFromResourceUrl(url: string): string | undefined {
  const fromHtml = extractYoutubeVideoId(url);
  if (fromHtml) return fromHtml;
  try {
    const u = new URL(url);
    const v = u.searchParams.get("v");
    if (u.hostname.includes("youtube.com") && v) return v.slice(0, 11);
    if (u.hostname === "youtu.be") return u.pathname.replace(/^\//, "").slice(0, 11);
  } catch {
    /* ignore */
  }
  return undefined;
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|#|$)/i.test(url);
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(url);
}

function isGoogleDocUrl(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return h === "docs.google.com" || h.endsWith(".google.com");
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const guides = await getGuides();
  const found = findGuideByParams(type, slug, guides);
  if (!found) return { title: "Not Found" };
  return buildMetadata({
    title: `${found.item.label} | Opolis Resources`,
    description: `${found.item.type} — ${found.section.cat}`,
    path: `/resources/guides/${type}/${slug}`,
  });
}

export default async function GuideViewerPage({ params }: PageProps) {
  const { type, slug } = await params;
  const guides = await getGuides();
  const found = findGuideByParams(type, slug, guides);
  if (!found) notFound();

  const { item, section } = found;
  const url = item.url.trim();
  const yt = extractYoutubeFromResourceUrl(url);

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Guides", path: "/resources/guides" },
    { name: item.label, path: `/resources/guides/${type}/${slug}` },
  ]);

  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <section className="sec-alt">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <Link
            href="/resources/guides"
            style={{
              display: "inline-block",
              marginBottom: 24,
              fontSize: 14,
              fontWeight: 600,
              color: C.red,
              textDecoration: "none",
            }}
          >
            ← Guides
          </Link>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: section.cc,
              marginBottom: 10,
            }}
          >
            {section.cat} · {item.type}
          </p>
          <h1
            className="cond serif"
            style={{
              fontSize: "clamp(26px,3.5vw,38px)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: 28,
              lineHeight: 1.2,
            }}
          >
            {item.label}
          </h1>

          {yt ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                marginBottom: 28,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${C.border}`,
                background: "#0a0a0a",
              }}
            >
              <iframe
                title={item.label}
                src={`https://www.youtube-nocookie.com/embed/${yt}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          ) : null}

          {!yt && isPdfUrl(url) ? (
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "4 / 3",
                  maxHeight: "min(80vh, 900px)",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${C.border}`,
                  background: "#111",
                }}
              >
                <iframe
                  title={item.label}
                  src={viewerUrl}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              </div>
              <p style={{ marginTop: 14, fontSize: 13, color: C.gray }}>
                If the preview does not load, open the file directly.
              </p>
            </div>
          ) : null}

          {!yt && !isPdfUrl(url) && isImageUrl(url) ? (
            <figure style={{ margin: "0 0 28px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: "min(85vh, 1200px)",
                  objectFit: "contain",
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  display: "block",
                  background: "#111",
                }}
              />
            </figure>
          ) : null}

          {!yt && !isPdfUrl(url) && !isImageUrl(url) ? (
            <div
              style={{
                padding: 28,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                background: C.card,
                marginBottom: 28,
              }}
            >
              <p style={{ color: C.lgray, fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>
                {isGoogleDocUrl(url)
                  ? "This resource opens in Google Docs or an external viewer."
                  : "This resource opens on an external site or in a new tab."}
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 22px",
                  background: C.red,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: 15,
                  borderRadius: 8,
                  textDecoration: "none",
                }}
              >
                Open resource ↗
              </a>
            </div>
          ) : null}

          {(isPdfUrl(url) || isImageUrl(url)) && (
            <p style={{ marginBottom: 0 }}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: C.red, fontWeight: 600, fontSize: 14 }}
              >
                Download / open original file ↗
              </a>
            </p>
          )}
        </div>
      </section>
    </>
  );
}
