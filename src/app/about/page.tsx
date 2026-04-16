import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { C } from "@/lib/constants";

const COMMUNITY_JOIN_URL = "https://commons.opolis.co/community";

const TIMELINE_ITEMS = [
  {
    year: "2000",
    top: "Lakeshore Founded",
    bot: "Staffing company employing 40,000 workers in 36 states",
    hi: false,
  },
  {
    year: "2017",
    top: "Sold to Employees",
    bot: "Lakeshore sold; cooperative thinking takes root",
    hi: false,
  },
  {
    year: "2019",
    top: "Opolis Launches",
    bot: "Web3-first market; Employment Commons LCA formed in Colorado",
    hi: true,
  },
  {
    year: "2022",
    top: "25x Growth",
    bot: "A community is born; operating in 50 states",
    hi: false,
  },
  {
    year: "2023",
    top: "Expanded Reach",
    bot: "Partnered with Freelancers Union and beyond",
    hi: false,
  },
  {
    year: "2024",
    top: "$100M Processed",
    bot: "Cooperative milestone; traditional solopreneurs onboard",
    hi: false,
  },
  {
    year: "2026",
    top: "$210M+ Processed",
    bot: "1,150+ W-2s issued across all 50 states + D.C.",
    hi: true,
  },
] as const;

const ETHOS = [
  {
    h: "Work should be chosen.",
    d: "Independent professionals choose their work, their clients, and their schedule. Opolis exists to make that choice economically viable without sacrificing stability or benefits.",
  },
  {
    h: "Ownership changes incentives.",
    d: "When workers own the platform, the platform works for workers. The cooperative succeeds only when Members succeed.",
  },
  {
    h: "Infrastructure is a collective good.",
    d: "Payroll, benefits, and compliance shouldn't require a corporate employer behind you. Pooled purchasing power makes it possible for anyone.",
  },
  {
    h: "Independent work is better together.",
    d: "Every Member is part of a community of professionals who share infrastructure, knowledge, and a stake in something they collectively own.",
  },
] as const;

const BOARD = [
  { n: "John Paller", t: "Chair & Founder" },
  { n: "[Vacant]", t: "Executive Board Member" },
  { n: "Auryn Macmillan", t: "Community Board Member" },
  { n: "Spencer Graham", t: "Community Board Member" },
  { n: "Barry Goers", t: "Board Member" },
  { n: "Felix Machart", t: "Board Member" },
  { n: "[Vacant]", t: "Board Member" },
] as const;

const TEAM = [
  { n: "Will Morgan", t: "Executive Steward" },
  { n: "Becky Guinan", t: "Accounting Steward" },
  { n: "Matt Tyus", t: "Payroll & Support Steward" },
  { n: "Robert Hamilton", t: "Accounting Steward" },
  { n: "Danielle Jones", t: "Ops & Admin Steward" },
  { n: "David Jenkins", t: "Membership Steward" },
  { n: "Carlos Londoño", t: "Dev & IT Steward" },
  { n: "Micah Baylor", t: "Insurance & Benefits Steward" },
] as const;

export const metadata: Metadata = buildMetadata({
  title: "About Opolis — Vision, Genesis & Team",
  description:
    "Opolis: work city, owned by workers. Member-owned employment cooperative — vision, genesis from Lakeshore to $210M+ payroll, Board of Stewards, and team.",
  path: "/about",
});

const aboutBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "About Opolis", path: "/about" },
]);

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aboutBreadcrumb),
        }}
      />
      <section
        className="page-hero"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <span className="slabel">About Opolis</span>
          <h1 className="cond">
            Work city.
            <br />
            <span style={{ color: C.red }}>Owned by workers.</span>
          </h1>
          <p className="page-hero-lead page-hero-lead--wide">
            <em>Opus</em> — work. <em>Polis</em> — community. A platform where
            independent professionals choose how, where, and with whom they
            work, with the full infrastructure of employment behind them.
          </p>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <span className="slabel">Vision &amp; Purpose</span>
          <h2 className="cond h2-section h2-section--page h2-section--after-lg">
            A new paradigm
            <br />
            for independent work.
          </h2>
          <div
            className="g2"
            style={{ gap: 48, alignItems: "start" }}
          >
            <p className="section-lead" style={{ marginBottom: 0 }}>
              Opolis exists to enable solopreneurs, the self-employed, and
              independent workers to express their unique creativity — to choose
              from where, with whom, and how much work makes sense for their
              personal goals. With an estimated 90 million self-employed workers
              in the U.S. by 2028, virtually all existing HR and employment
              technology is still designed for corporations, not for the people
              doing the work.
            </p>
            <div
              style={{
                background: "rgba(210,70,30,0.12)",
                border: "1px solid rgba(210,70,30,0.25)",
                borderRadius: 8,
                padding: "18px 22px",
              }}
            >
              <p
                style={{
                  color: "#fff",
                  fontSize: 15,
                  lineHeight: 1.82,
                  margin: 0,
                  fontWeight: 700,
                }}
              >
                Opolis is a different model — a cooperative where mutualistic
                outcomes prevail for workers and the clients they serve.
                Employment infrastructure belongs to the workers who use it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap" style={{ maxWidth: 960 }}>
          <span className="slabel">Genesis</span>
          <h2 className="cond h2-section h2-section--page h2-section--after-lg">
            Where we came from.
          </h2>
          <p
            className="section-lead"
            style={{ maxWidth: 700, marginBottom: 64 }}
          >
            Founded in 2019 by John Paller and Eddie Pastore, Opolis set out to
            bring employment-grade infrastructure to independent workers through
            a member-owned cooperative. The first payroll ran in 2020. Since
            then, the cooperative has processed over $210M in payroll and issued
            1,150+ W-2s across all 50 states.
          </p>

          <div style={{ overflowX: "auto", paddingBottom: 8 }}>
            <div
              style={{
                minWidth: 700,
                position: "relative",
                padding: "56px 0 56px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  right: 0,
                  height: 2,
                  background: C.border,
                  transform: "translateY(-50%)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {TIMELINE_ITEMS.map((t, i) => {
                  const above = i % 2 === 0;
                  return (
                    <div
                      key={t.year}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          height: 72,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: above ? "flex-end" : "flex-start",
                          alignItems: "center",
                          marginBottom: above ? 12 : 0,
                          marginTop: above ? 0 : 12,
                          textAlign: "center",
                        }}
                      >
                        {above && (
                          <>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: t.hi ? "#fff" : C.lgray,
                                marginBottom: 3,
                                maxWidth: 100,
                                textAlign: "center",
                              }}
                            >
                              {t.top}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.gray,
                                maxWidth: 100,
                                lineHeight: 1.4,
                                textAlign: "center",
                              }}
                            >
                              {t.bot}
                            </div>
                          </>
                        )}
                      </div>
                      <div
                        style={{
                          width: t.hi ? 22 : 16,
                          height: t.hi ? 22 : 16,
                          borderRadius: "50%",
                          background: t.hi ? C.red : C.border,
                          border: `3px solid ${C.dark}`,
                          zIndex: 2,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        className="cond"
                        style={{
                          fontSize: t.hi ? 20 : 16,
                          fontWeight: 900,
                          color: t.hi ? C.red : C.lgray,
                          margin: "8px 0",
                          lineHeight: 1,
                        }}
                      >
                        {t.year}
                      </div>
                      <div
                        style={{
                          height: 72,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        {!above && (
                          <>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 12,
                                color: t.hi ? "#fff" : C.lgray,
                                marginBottom: 3,
                                maxWidth: 100,
                                textAlign: "center",
                              }}
                            >
                              {t.top}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: C.gray,
                                maxWidth: 100,
                                lineHeight: 1.4,
                                textAlign: "center",
                              }}
                            >
                              {t.bot}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <span className="slabel">Our Ethos</span>
          <h2 className="cond h2-section h2-section--page h2-section--after-lg">
            What we believe.
          </h2>
          <div className="g2" style={{ gap: 16 }}>
            {ETHOS.map((e) => (
              <div key={e.h} className="dc" style={{ padding: "26px 24px" }}>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  {e.h}
                </h3>
                <p style={{ color: C.gray, fontSize: 14, lineHeight: 1.72 }}>
                  {e.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          <span className="slabel">Governance</span>
          <h2 className="cond h2-section h2-section--page">
            Board of Stewards.
          </h2>
          <p
            className="section-lead"
            style={{ marginBottom: 40, maxWidth: 560 }}
          >
            The Board of Stewards is elected by Employee Members and provides
            oversight of the cooperative&apos;s direction, finances, and values.
          </p>
          <div className="g4" style={{ gap: 14 }}>
            {BOARD.map((s, i) => (
              <div
                key={`${s.n}-${i}`}
                className="dc"
                style={{ padding: "20px 20px", textAlign: "center" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: C.border,
                    margin: "0 auto 12px",
                  }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 12, color: C.gray }}>{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap">
          <span className="slabel">Team</span>
          <h2 className="cond h2-section h2-section--page">
            The people behind the platform.
          </h2>
          <p
            className="section-lead"
            style={{ marginBottom: 40, maxWidth: 560 }}
          >
            A small, focused team of operators who have spent their careers in
            payroll compliance, HR technology, and cooperative finance.
          </p>
          <div className="g4" style={{ gap: 14 }}>
            {TEAM.map((s, i) => (
              <div
                key={`${s.n}-${i}`}
                className="dc"
                style={{ padding: "20px 20px", textAlign: "center" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: C.border,
                    margin: "0 auto 12px",
                  }}
                />
                <div
                  style={{
                    fontWeight: 700,
                    color: "#fff",
                    fontSize: 14,
                    marginBottom: 4,
                  }}
                >
                  {s.n}
                </div>
                <div style={{ fontSize: 12, color: C.gray }}>{s.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="cta-section"
        style={{
          background: C.red,
          textAlign: "center",
        }}
      >
        <div className="cta-pattern-layer" aria-hidden />
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <h2
            className="cond"
            style={{
              fontSize: "clamp(32px,4vw,56px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.0,
              marginBottom: 14,
            }}
          >
            Be part of the cooperative.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.82)",
              fontSize: 17,
              maxWidth: 520,
              margin: "0 auto 34px",
              lineHeight: 1.68,
            }}
          >
            Ownership, community, and access to the full employment stack — when
            you&apos;re ready.
          </p>
          <a
            href={COMMUNITY_JOIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wht lg"
          >
            Join the Co-op →
          </a>
        </div>
      </section>
    </>
  );
}
