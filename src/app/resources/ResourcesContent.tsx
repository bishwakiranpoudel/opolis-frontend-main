"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, X, Minus } from "lucide-react";
import { C } from "@/lib/constants";
import type { FaqSection, GuidesSection } from "@/lib/resourcesData";
import {
  FAQ_SECTIONS,
  CMP_ROWS,
  CMP_COLS,
  PRICING_TIERS,
  GUIDES_DATA,
  BLOG_CATS,
  BLOG_CAT_COLORS,
} from "@/lib/resourcesData";
import { ALL_POSTS, blogPostPath, type BlogPost } from "@/lib/blogPosts";
import { decodeHtmlEntitiesLite } from "@/lib/podcastContent";
import {
  PODCAST_SERIES_META,
  podcastEpisodePath,
  type PodcastEpisode,
} from "@/lib/podcastTypes";
import {
  RESOURCES_COMPARE_PATH,
  RESOURCES_FAQ_PATH,
  RESOURCES_GUIDES_PATH,
  RESOURCES_PRICING_PATH,
} from "@/lib/resourcesPaths";
import { resolveGuideItemHref } from "@/lib/guideItems";

const JOIN_URL = "https://commons.opolis.co/coalition/webinarspecial";

/** Blog listing tab URL (legacy `/blog` can redirect here). */
export const RESOURCES_BLOG_PATH = "/resources/blog";

/** Podcast listing (UNEMPLOYABLE & Opolis Public Radio episodes). */
export const RESOURCES_PODCASTS_PATH = "/resources/podcasts";

export {
  RESOURCES_COMPARE_PATH,
  RESOURCES_FAQ_PATH,
  RESOURCES_GUIDES_PATH,
  RESOURCES_PRICING_PATH,
} from "@/lib/resourcesPaths";

type ResourcesTab = "pricing" | "compare" | "guides" | "faq" | "blog" | "podcasts";

function resourcesTabFromPath(pathname: string): ResourcesTab {
  const p = pathname.toLowerCase();
  if (p.startsWith("/resources/blog")) return "blog";
  if (p.startsWith("/resources/podcasts")) return "podcasts";
  if (p.startsWith("/resources/guides")) return "guides";
  if (p === RESOURCES_FAQ_PATH) return "faq";
  if (p === RESOURCES_COMPARE_PATH) return "compare";
  if (p === RESOURCES_PRICING_PATH || p === "/resources") return "pricing";
  return "pricing";
}

type ResourcesContentProps = {
  initialPosts?: BlogPost[];
  initialPodcasts?: PodcastEpisode[];
  initialGuides?: GuidesSection[];
  initialFaq?: FaqSection[];
};

export function ResourcesContent({
  initialPosts,
  initialPodcasts,
  initialGuides,
  initialFaq,
}: ResourcesContentProps) {
  const pathname = usePathname();
  const guides = initialGuides ?? GUIDES_DATA;
  const faqSections = initialFaq ?? FAQ_SECTIONS;

  const tab = resourcesTabFromPath(pathname);
  const [blogCat, setBlogCat] = useState("All");
  const [blogSearch, setBlogSearch] = useState("");

  const posts = initialPosts ?? ALL_POSTS;
  const podcasts = initialPodcasts ?? [];

  const filteredPosts = posts.filter(
    (p) =>
      (blogCat === "All" || p.cat === blogCat) &&
      (blogSearch === "" || p.h.toLowerCase().includes(blogSearch.toLowerCase()))
  );

  return (
    <>
      <section
        className="page-hero page-hero-resources"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <span className="slabel">Resources</span>
          <h1 className="cond">Resources.</h1>
          <div className="tabs">
            {(
              [
                { id: "pricing" as const, l: "Pricing", href: RESOURCES_PRICING_PATH },
                { id: "compare" as const, l: "Comparisons", href: RESOURCES_COMPARE_PATH },
                { id: "guides" as const, l: "Guides", href: RESOURCES_GUIDES_PATH },
                { id: "faq" as const, l: "FAQ", href: RESOURCES_FAQ_PATH },
                { id: "blog" as const, l: "Blog", href: RESOURCES_BLOG_PATH },
                { id: "podcasts" as const, l: "Podcast", href: RESOURCES_PODCASTS_PATH },
              ] as const
            ).map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className={`tab${tab === t.id ? " on" : ""}`}
              >
                {t.l}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          {/* PRICING */}
          {tab === "pricing" && (
            <>
              <h2 id="pricing" className="cond h2-section h2-section--resources-tab">
                Simple, transparent pricing.
              </h2>
              <p
                className="section-lead section-lead--narrow"
                style={{ marginBottom: 44 }}
              >
                Two tiers. Start with the community, upgrade when you&apos;re
                ready for the full employment product.
              </p>
              <div className="g2" style={{ maxWidth: 820 }}>
                {PRICING_TIERS.map((p) => (
                  <div
                    key={p.tier}
                    style={{
                      background: p.dark
                        ? "rgba(232,67,45,.07)"
                        : C.card,
                      border: `1px solid ${
                        p.dark ? C.red + "44" : C.border
                      }`,
                      borderRadius: 14,
                      padding: 36,
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {p.badge && (
                      <div
                        style={{
                          position: "absolute",
                          top: 22,
                          right: 22,
                          background: C.red,
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          padding: "3px 10px",
                          borderRadius: 100,
                          textTransform: "uppercase",
                        }}
                      >
                        {p.badge}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: C.red,
                        marginBottom: 10,
                      }}
                    >
                      {p.tier}
                    </div>
                    <div
                      className="cond"
                      style={{
                        fontSize: 54,
                        fontWeight: 900,
                        color: "#fff",
                        lineHeight: 1,
                      }}
                    >
                      {p.price}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.gray,
                        marginBottom: 16,
                      }}
                    >
                      {p.freq}
                    </div>
                    <p
                      style={{
                        color: C.lgray,
                        fontSize: 14,
                        lineHeight: 1.68,
                        marginBottom: p.sub ? 8 : 16,
                      }}
                    >
                      {p.desc}
                    </p>
                    {p.sub && (
                      <p
                        style={{
                          color: C.gray,
                          fontSize: 12,
                          lineHeight: 1.65,
                          marginBottom: 16,
                          fontStyle: "italic",
                        }}
                      >
                        {p.sub}
                      </p>
                    )}
                    <ul
                      style={{
                        listStyle: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: 9,
                        marginBottom: 28,
                        flex: 1,
                        padding: 0,
                        margin: 0,
                      }}
                    >
                      {p.features.map((f) => (
                        <li
                          key={f}
                          style={{
                            display: "flex",
                            gap: 9,
                            fontSize: 13,
                            color: C.lgray,
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            style={{
                              color: C.red,
                              flexShrink: 0,
                              marginTop: 2,
                            }}
                            aria-hidden
                          >
                            <Check size={14} strokeWidth={2.5} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    {p.dark ? (
                      <Link
                        href="/eligibility"
                        className="btn-text"
                        style={{ fontSize: 13, textAlign: "left" }}
                      >
                        Check eligibility →
                      </Link>
                    ) : (
                      <a
                        href={JOIN_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-red"
                        style={{
                          width: "100%",
                          justifyContent: "center",
                        }}
                      >
                        Join the Co-op →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* COMPARISONS */}
          {tab === "compare" && (
            <>
              <h2
                id="compare"
                className="cond"
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: 32,
                }}
              >
                How Opolis Compares
              </h2>
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                }}
              >
                <table className="ct">
                  <thead>
                    <tr>
                      <th
                        style={{
                          background: C.dark,
                          paddingLeft: 20,
                          textAlign: "left",
                        }}
                      >
                        Feature
                      </th>
                      {CMP_COLS.map((c, i) => (
                        <th
                          key={c}
                          className={i === 0 ? "hl" : ""}
                          style={{
                            background:
                              i === 0 ? "rgba(232,67,45,.09)" : C.dark,
                          }}
                        >
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CMP_ROWS.map((r) => (
                      <tr key={r.f}>
                        <td>{r.f}</td>
                        {r.v.map((v, i) => (
                          <td
                            key={i}
                            style={{
                              background:
                                i === 0 ? "rgba(232,67,45,.04)" : "",
                            }}
                          >
                            <span
                              className={
                                v === "✓"
                                  ? "chk"
                                  : v === "✗"
                                    ? "cno"
                                    : "cpar"
                              }
                              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                              aria-label={v === "✓" ? "Yes" : v === "✗" ? "No" : "Partial"}
                            >
                              {v === "✓" && <Check size={16} strokeWidth={2.5} />}
                              {v === "✗" && <X size={16} strokeWidth={2.5} />}
                              {v === "~" && <Minus size={16} strokeWidth={2.5} />}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p
                style={{ fontSize: 11, color: C.gray, marginTop: 11, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Check size={12} strokeWidth={2.5} className="chk" /> Full support
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Minus size={12} strokeWidth={2.5} className="cpar" /> Partial
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <X size={12} strokeWidth={2.5} className="cno" /> Not available
                </span>
              </p>
            </>
          )}

          {/* GUIDES */}
          {tab === "guides" && (
            <div style={{ maxWidth: 820 }}>
              <h2 id="guides" className="cond h2-section h2-section--resources-tab">
                Guides
              </h2>
              <p className="section-lead" style={{ marginBottom: 44 }}>
                Resources to help you understand independent employment — from
                entity setup to benefits selection.
              </p>
              {guides.map((sec) => (
                <div key={sec.cat} style={{ marginBottom: 40 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: sec.cc,
                      marginBottom: 14,
                      paddingBottom: 10,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {sec.cat}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {sec.items.map((item) => {
                      const href = resolveGuideItemHref(item, sec, guides);
                      const linkStyle = {
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "11px 14px",
                        borderRadius: 8,
                        textDecoration: "none",
                        transition: "background 0.15s",
                        color: "inherit",
                      } as const;
                      const content = (
                        <>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: sec.cc,
                              width: 80,
                              flexShrink: 0,
                            }}
                          >
                            {item.type}
                          </span>
                          <span style={{ fontSize: 14, color: C.lgray }}>
                            {item.label}
                          </span>
                          <span
                            style={{
                              marginLeft: "auto",
                              color: C.red,
                              fontSize: 13,
                            }}
                          >
                            {href.startsWith("http") ? "↗" : "→"}
                          </span>
                        </>
                      );
                      return (
                        <Link
                          key={`${sec.cat}-${item.label}-${item.url}`}
                          href={href}
                          style={linkStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = C.card;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {content}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAQ — all sections and Q&A in the DOM for crawlers; <details> keeps answers indexable */}
          {tab === "faq" && (
            <div style={{ maxWidth: 900 }}>
              <h2 id="faq" className="cond h2-section h2-section--resources-tab">
                FAQ
              </h2>
              <p className="section-lead" style={{ marginBottom: 40 }}>
                Common questions about Opolis, membership, payroll, benefits,
                and the cooperative model.
              </p>
              <div
                className="faq-layout"
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr",
                  gap: 40,
                  alignItems: "start",
                }}
              >
                <nav className="faq-sidebar" aria-label="FAQ sections">
                  {faqSections.map((s) => (
                    <a
                      key={s.id}
                      href={`#faq-section-${s.id}`}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "9px 14px",
                        borderRadius: 7,
                        fontSize: 13,
                        fontWeight: 500,
                        color: C.gray,
                        background: "transparent",
                        border: "1px solid transparent",
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: 3,
                        transition: "all 0.15s",
                        cursor: "pointer",
                        textDecoration: "none",
                      }}
                    >
                      {s.label}
                    </a>
                  ))}
                </nav>
                <div>
                  {faqSections.map((s) => (
                    <section
                      key={s.id}
                      id={`faq-section-${s.id}`}
                      style={{ marginBottom: 48, scrollMarginTop: 96 }}
                    >
                      <h3
                        className="cond"
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#fff",
                          marginBottom: 18,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {s.label}
                      </h3>
                      {s.items.map((item, i) => (
                        <details key={i} className="faq-details">
                          <summary>
                            <span className="faq-details__q">{item.q}</span>
                            <span className="faq-details__icon" aria-hidden>
                              +
                            </span>
                          </summary>
                          <p className="faq-details__a">{item.a}</p>
                        </details>
                      ))}
                    </section>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BLOG */}
          {tab === "blog" && (
            <div style={{ maxWidth: 900 }}>
              <div style={{ marginBottom: 32 }}>
                <h2
                  id="blog"
                  className="cond h2-section h2-section--resources-tab"
                  style={{ marginBottom: 6 }}
                >
                  Blog
                </h2>
                <p style={{ color: C.gray, fontSize: 14 }}>
                  {posts.length} articles — read on this site
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  marginBottom: 32,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <input
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  placeholder="Search articles…"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "9px 14px",
                    color: "#fff",
                    fontSize: 13,
                    width: 220,
                    outline: "none",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {BLOG_CATS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setBlogCat(c)}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "6px 12px",
                        borderRadius: 20,
                        border: "1px solid",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        background:
                          blogCat === c
                            ? BLOG_CAT_COLORS[c] || C.red
                            : "transparent",
                        borderColor:
                          blogCat === c
                            ? BLOG_CAT_COLORS[c] || C.red
                            : C.border,
                        color: blogCat === c ? "#000" : C.gray,
                      }}
                    >
                      {c}
                      {c !== "All" && (
                        <span style={{ opacity: 0.6, marginLeft: 5, fontWeight: 400 }}>
                          {posts.filter((p) => p.cat === c).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {(blogSearch || blogCat !== "All") && (
                <div
                  style={{
                    color: C.gray,
                    fontSize: 12,
                    marginBottom: 18,
                  }}
                >
                  {filteredPosts.length} result
                  {filteredPosts.length !== 1 ? "s" : ""}
                  {blogSearch ? ` for "${blogSearch}"` : ""}
                  {blogCat !== "All" ? ` in ${blogCat}` : ""}
                </div>
              )}
              {filteredPosts.length === 0 ? (
                <div
                  style={{
                    color: C.gray,
                    fontSize: 14,
                    padding: "40px 0",
                  }}
                >
                  No articles match your search.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill,minmax(260px,1fr))",
                    gap: 12,
                  }}
                >
                  {filteredPosts.map((p: BlogPost, i: number) => {
                  const cardContent = (
                    <div
                      className="bcard"
                      style={{
                        background: C.card,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        padding: "18px 20px",
                        height: "100%",
                        boxSizing: "border-box",
                        transition: "border-color 0.15s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: BLOG_CAT_COLORS[p.cat] || p.cc,
                          }}
                        >
                          {p.cat}
                        </span>
                        <span style={{ fontSize: 11, color: C.gray }}>
                          {p.date}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#fff",
                          lineHeight: 1.45,
                          marginBottom: 14,
                        }}
                      >
                        {p.h}
                      </h3>
                      <span
                        style={{
                          fontSize: 12,
                          color: C.red,
                          fontWeight: 600,
                        }}
                      >
                        Read →
                      </span>
                    </div>
                  );
                  const linkStyle = {
                    display: "block" as const,
                    textDecoration: "none" as const,
                    color: "inherit" as const,
                  };
                  return p.slug ? (
                    <Link key={i} href={blogPostPath(p)} style={linkStyle}>
                      {cardContent}
                    </Link>
                  ) : (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={linkStyle}
                    >
                      {cardContent}
                    </a>
                  );
                })}
                </div>
              )}
              <div
                style={{
                  marginTop: 48,
                  paddingTop: 24,
                  borderTop: `1px solid ${C.border}`,
                  color: C.gray,
                  fontSize: 12,
                  lineHeight: 1.7,
                }}
              >
                <strong style={{ color: C.lgray }}>Note:</strong> Blog
                articles open on this site.                 Full list above.
              </div>
            </div>
          )}

          {/* PODCASTS */}
          {tab === "podcasts" && (
            <div style={{ maxWidth: 960 }}>
              <div style={{ marginBottom: 32 }}>
                <h2
                  id="podcasts"
                  className="cond h2-section h2-section--resources-tab"
                  style={{ marginBottom: 6 }}
                >
                  Podcast
                </h2>
                <p style={{ color: C.gray, fontSize: 14, lineHeight: 1.6 }}>
                  Two series —{" "}
                  <strong style={{ color: C.lgray }}>
                    {PODCAST_SERIES_META["opolis-public-radio"].title}
                  </strong>{" "}
                  (
                  {
                    podcasts.filter(
                      (p) => p.seriesKey === "opolis-public-radio"
                    ).length
                  }
                  ) and{" "}
                  <strong style={{ color: C.lgray }}>
                    {PODCAST_SERIES_META.unemployable.title}
                  </strong>{" "}
                  (
                  {
                    podcasts.filter((p) => p.seriesKey === "unemployable")
                      .length
                  }
                  ). {podcasts.length} episodes total.
                </p>
              </div>
              {podcasts.length === 0 ? (
                <p style={{ color: C.gray, fontSize: 14, padding: "32px 0" }}>
                  No episodes loaded yet. Import podcast episodes into Firestore
                  or set WORDPRESS_URL for WordPress mode.
                </p>
              ) : (
                <>
                  {podcasts.map((ep, idx) => {
                    const prev = idx > 0 ? podcasts[idx - 1] : null;
                    const showSeriesHeading =
                      !prev ||
                      prev.seriesKey !== ep.seriesKey ||
                      (ep.seriesKey === "unemployable" &&
                        prev.episodeSeasonSort !== ep.episodeSeasonSort);
                    const excerptPlain = ep.excerptHtml
                      .replace(/<[^>]+>/g, "")
                      .replace(/\s+/g, " ")
                      .trim();
                    const excerptPreview = excerptPlain.slice(0, 160);
                    const preview = decodeHtmlEntitiesLite(
                      excerptPreview.length >= 160
                        ? `${excerptPreview}…`
                        : excerptPreview
                    );
                    return (
                      <div key={ep.slug}>
                        {showSeriesHeading && (
                          <div
                            style={{
                              marginTop: idx === 0 ? 0 : 40,
                              marginBottom: 18,
                            }}
                          >
                            <h3
                              className="cond"
                              style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#fff",
                                marginBottom: 6,
                              }}
                            >
                              {ep.seriesKey === "unemployable"
                                ? `${ep.seriesTitle} · ${ep.episodeSeasonLabel}`
                                : ep.seriesTitle}
                            </h3>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: C.gray,
                                letterSpacing: "0.04em",
                              }}
                            >
                              <span
                                style={{
                                  display: "inline-block",
                                  marginRight: 10,
                                  padding: "2px 8px",
                                  borderRadius: 6,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  background: `${C.red}33`,
                                  color: C.red,
                                }}
                              >
                                {PODCAST_SERIES_META[ep.seriesKey].shortLabel}
                              </span>
                              {ep.seriesKey === "unemployable"
                                ? ep.episodeSeasonLabel
                                : ep.seasonLabel}
                            </p>
                          </div>
                        )}
                        <Link
                          href={podcastEpisodePath(ep.slug)}
                          style={{
                            display: "block",
                            textDecoration: "none",
                            color: "inherit",
                            marginBottom: 14,
                          }}
                        >
                          <div
                            className="bcard"
                            style={{
                              background: C.card,
                              border: `1px solid ${C.border}`,
                              borderRadius: 10,
                              overflow: "hidden",
                              display: "grid",
                              gridTemplateColumns:
                                "minmax(120px, 200px) 1fr",
                              gap: 0,
                              transition: "border-color 0.15s",
                            }}
                          >
                            <div
                              style={{
                                background: "#141414",
                                minHeight: 120,
                                position: "relative",
                              }}
                            >
                              {ep.thumbnailUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element -- CMS URLs
                                <img
                                  src={ep.thumbnailUrl}
                                  alt=""
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                    aspectRatio: "16 / 9",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "100%",
                                    aspectRatio: "16 / 9",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: C.gray,
                                    fontSize: 11,
                                  }}
                                >
                                  No thumbnail
                                </div>
                              )}
                            </div>
                            <div style={{ padding: "18px 20px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 10,
                                  gap: 12,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: C.red,
                                  }}
                                >
                                  {PODCAST_SERIES_META[ep.seriesKey].shortLabel}
                                </span>
                                <span style={{ fontSize: 11, color: C.gray }}>
                                  {ep.date}
                                </span>
                              </div>
                              <h3
                                style={{
                                  fontSize: 15,
                                  fontWeight: 700,
                                  color: "#fff",
                                  lineHeight: 1.45,
                                  marginBottom: preview ? 10 : 0,
                                }}
                              >
                                {decodeHtmlEntitiesLite(ep.title)}
                              </h3>
                              {preview ? (
                                <p
                                  style={{
                                    fontSize: 13,
                                    color: C.lgray,
                                    lineHeight: 1.55,
                                    margin: 0,
                                  }}
                                >
                                  {preview}
                                </p>
                              ) : null}
                              <span
                                style={{
                                  fontSize: 12,
                                  color: C.red,
                                  fontWeight: 600,
                                  display: "inline-block",
                                  marginTop: 12,
                                }}
                              >
                                Listen / watch →
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        className="cta-section"
        style={{
          textAlign: "center",
        }}
      >
        <div className="cta-pattern-layer" aria-hidden />
        <div className="wrap">
          <h2 className="cond h2-section h2-section--promo">
            Now you know. Ready to join?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.82)",
              fontSize: 16,
              maxWidth: 480,
              margin: "28px auto 0",
              lineHeight: "var(--lh-body-loose)",
            }}
          >
            Everything you need to make a confident decision is here. The Co-op
            is $97 to start.
          </p>
          <a
            href={JOIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wht"
            style={{
              marginTop: 28,
              padding: "14px 34px",
              fontSize: 15,
              display: "inline-flex",
            }}
          >
            Join the Co-op →
          </a>
        </div>
      </section>
    </>
  );
}
