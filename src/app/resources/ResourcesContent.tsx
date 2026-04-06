"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { ALL_POSTS, type BlogPost } from "@/lib/blogPosts";

const JOIN_URL = "https://commons.opolis.co/coalition/webinarspecial";

/** Blog listing tab URL (legacy `/blog` can redirect here). */
export const RESOURCES_BLOG_PATH = "/resources/blog";

type ResourcesTab = "pricing" | "compare" | "guides" | "faq" | "blog";

type ResourcesContentProps = {
  initialPosts?: BlogPost[];
  initialGuides?: GuidesSection[];
  initialFaq?: FaqSection[];
  initialTab?: ResourcesTab;
};

export function ResourcesContent({
  initialPosts,
  initialGuides,
  initialFaq,
  initialTab = "pricing",
}: ResourcesContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const guides = initialGuides ?? GUIDES_DATA;
  const faqSections = initialFaq ?? FAQ_SECTIONS;

  const [tab, setTab] = useState<ResourcesTab>(initialTab);
  const [openSection, setOpenSection] = useState(faqSections[0]?.id ?? "overview");
  const [openItem, setOpenItem] = useState<number | null>(null);
  const [blogCat, setBlogCat] = useState("All");
  const [blogSearch, setBlogSearch] = useState("");

  const posts = initialPosts ?? ALL_POSTS;

  const filteredPosts = posts.filter(
    (p) =>
      (blogCat === "All" || p.cat === blogCat) &&
      (blogSearch === "" || p.h.toLowerCase().includes(blogSearch.toLowerCase()))
  );

  useEffect(() => {
    if (pathname === RESOURCES_BLOG_PATH) setTab("blog");
    else if (pathname === "/resources") {
      setTab((t) => (t === "blog" ? "pricing" : t));
    }
  }, [pathname]);

  function selectTab(id: ResourcesTab) {
    if (id === "blog") {
      router.push(RESOURCES_BLOG_PATH);
      setTab("blog");
    } else {
      if (pathname === RESOURCES_BLOG_PATH) router.push("/resources");
      setTab(id);
    }
  }

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
                { id: "pricing" as const, l: "Pricing" },
                { id: "compare" as const, l: "Comparisons" },
                { id: "guides" as const, l: "Guides" },
                { id: "faq" as const, l: "FAQ" },
                { id: "blog" as const, l: "Blog" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab${tab === t.id ? " on" : ""}`}
                onClick={() => selectTab(t.id)}
              >
                {t.l}
              </button>
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
                      const isInternal =
                        item.url.startsWith("/") && !item.url.startsWith("//");
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
                            {isInternal ? "→" : "↗"}
                          </span>
                        </>
                      );
                      return isInternal ? (
                        <Link
                          key={item.label}
                          href={item.url}
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
                      ) : (
                        <a
                          key={item.label}
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          style={linkStyle}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = C.card;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {content}
                        </a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAQ */}
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
                <div className="faq-sidebar">
                  {faqSections.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setOpenSection(s.id);
                        setOpenItem(null);
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "9px 14px",
                        borderRadius: 7,
                        fontSize: 13,
                        fontWeight: openSection === s.id ? 700 : 400,
                        color: openSection === s.id ? "#fff" : C.gray,
                        background:
                          openSection === s.id ? C.card : "transparent",
                        border:
                          openSection === s.id
                            ? `1px solid ${C.border}`
                            : "1px solid transparent",
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: 3,
                        transition: "all 0.15s",
                        cursor: "pointer",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                <div>
                  {faqSections.filter((s) => s.id === openSection).map(
                    (s) => (
                      <div key={s.id}>
                        {s.items.map((item, i) => (
                          <div
                            key={i}
                            style={{
                              borderBottom: `1px solid ${C.border}`,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setOpenItem(openItem === i ? null : i)
                              }
                              style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "18px 0",
                                textAlign: "left",
                                fontFamily: "'DM Sans', sans-serif",
                                background: "transparent",
                                cursor: "pointer",
                                border: "none",
                                color: "inherit",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 15,
                                  fontWeight: 600,
                                  color: "#fff",
                                  lineHeight: 1.4,
                                  paddingRight: 20,
                                }}
                              >
                                {item.q}
                              </span>
                              <span
                                style={{
                                  color: C.red,
                                  fontSize: 18,
                                  flexShrink: 0,
                                  transition: "transform 0.2s",
                                  display: "inline-block",
                                  transform:
                                    openItem === i
                                      ? "rotate(45deg)"
                                      : "rotate(0deg)",
                                }}
                              >
                                +
                              </span>
                            </button>
                            {openItem === i && (
                              <p
                                style={{
                                  color: C.lgray,
                                  fontSize: 14,
                                  lineHeight: 1.78,
                                  paddingBottom: 20,
                                  marginTop: -4,
                                }}
                              >
                                {item.a}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
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
                    <Link key={i} href={`/blog/${p.slug}`} style={linkStyle}>
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
                articles open on this site. Full list above.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: C.red,
          padding: "80px 0",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="o-pattern"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            pointerEvents: "none",
          }}
        />
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
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
