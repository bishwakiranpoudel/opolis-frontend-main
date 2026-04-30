import Link from "next/link";
import {
  FileText,
  Heart,
  ShieldCheck,
  BadgeCheck,
  Users,
  Check,
} from "lucide-react";
import { C } from "@/lib/constants";
import { breadcrumbJsonLd } from "@/lib/seo";

const JOIN_URL = "https://commons.opolis.co/coalition/webinarspecial";

const homeBreadcrumb = breadcrumbJsonLd([{ name: "Home", path: "/" }]);

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumb) }}
      />
      <section
        className="hero-section"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="wrap"
          style={{ position: "relative", zIndex: 1, textAlign: "center" }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="pill fu">
              <span className="rdot" />
              Member-Owned Employment Cooperative
            </div>
          </div>
          <h1
            className="cond fu fu1"
            style={{
              fontSize: "clamp(40px, 5.5vw, 72px)",
              fontWeight: 900,
              lineHeight: 0.93,
              letterSpacing: "-0.01em",
              marginBottom: 20,
            }}
          >
            Independent work.
            <br />
            <span style={{ color: C.red }}>Collective power.</span>
          </h1>
          <p
            className="fu fu2"
            style={{
              fontSize: 17,
              color: C.lgray,
              maxWidth: 720,
              margin: "0 auto 28px",
              lineHeight: 1.5,
            }}
          >
            Employment infrastructure shouldn&apos;t be a privilege reserved for
            people with a boss.
            <br />
            With Opolis, independent professionals get the payroll, benefits,
            and compliance they deserve: owned collectively, built to last.
          </p>
          <div
            className="fu fu3 hero-actions"
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a
              href={JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-red lg"
            >
              Join the Co-op →
            </a>
            <Link href="/the-cooperative" className="btn-outline">
              See how it works
            </Link>
          </div>
        </div>
      </section>

      <section
        className="stats-section"
        style={{
          background: C.dark,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: 0,
        }}
      >
        <div className="wrap">
          <div className="stats-grid">
            {[
              {
                stat: "$210M+",
                label: "Payroll Processed",
                sub: "2020 – 2025",
              },
              { stat: "1,150+", label: "W-2s Issued", sub: "2020 – 2025" },
              { stat: "50", label: "States Covered", sub: "+ Washington D.C." },
            ].map((s, i) => (
              <div
                key={s.stat}
                className="stats-cell"
                style={{
                  padding: "32px 40px",
                  borderLeft: i > 0 ? `1px solid ${C.border}` : "none",
                  textAlign: "center",
                }}
              >
                <div
                  className="cond"
                  style={{
                    fontSize: "clamp(42px,5vw,64px)",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}
                >
                  {s.stat}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.lgray,
                    marginBottom: 3,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 12, color: C.gray }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          <span className="slabel">What Membership Gets You</span>
          <h2
            className="cond"
            style={{
              fontSize: "clamp(42px,5vw,66px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.04,
              marginBottom: 14,
            }}
          >
            Solo business.
            <br />
            Collective infrastructure.
          </h2>
          <p
            style={{
              color: C.gray,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 640,
            }}
          >
            The leverage large employers take for granted — group rates,
            compliant payroll, W-2 status — belongs to everyone willing to build
            it together.
          </p>
          <div className="outcomes-grid">
            {[
              {
                Icon: FileText,
                h: "W-2 Payroll",
                p: "Semi-monthly direct deposit, every cycle.",
              },
              {
                Icon: Heart,
                h: "Group Benefits",
                p: "Health, dental, vision, 401(k), disability.",
              },
              {
                Icon: ShieldCheck,
                h: "Full Compliance",
                p: "FICA, 941s, withholding — handled automatically.",
              },
              {
                Icon: BadgeCheck,
                h: "W-2 Status",
                p: "Mortgages, leases, and loans made accessible.",
              },
              {
                Icon: Users,
                h: "Co-op Ownership",
                p: "Members own the cooperative and participate in its governance and profits.",
              },
            ].map(({ Icon, h, p }) => (
              <div key={h} className="outcome-card">
                <div className="outcome-card-icon" aria-hidden>
                  <Icon strokeWidth={1.8} />
                </div>
                <h3
                  className="cond"
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 6,
                    lineHeight: 1.25,
                  }}
                >
                  {h}
                </h3>
                <p style={{ color: C.gray, lineHeight: 1.6, fontSize: 13, margin: 0 }}>
                  {p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO MEMBERSHIP TIERS */}
      <section className="sec-alt">
        <div className="wrap">
          <span className="slabel">Membership Tiers</span>
          <h2
            className="cond"
            style={{
              fontSize: "clamp(42px,5vw,70px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.0,
              marginBottom: 16,
            }}
          >
            Two ways to belong.
          </h2>
          <p
            style={{
              color: C.gray,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 52,
              maxWidth: 720,
            }}
          >
            Start with community membership and access the cooperative
            immediately. When you&apos;re ready — and your S-Corp is in place —
            upgrade to Employee Membership for the full employment
            infrastructure.
          </p>
          <div className="g2" style={{ gap: 24 }}>
            <div
              className="dc"
              style={{
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                padding: 40,
              }}
            >
              <span className="ghost">01</span>
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.red,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Community Membership
                </div>
                <div
                  style={{
                    display: "inline-block",
                    fontSize: 12,
                    fontWeight: 700,
                    background: "rgba(232,67,45,.15)",
                    color: C.red,
                    padding: "4px 12px",
                    borderRadius: 100,
                  }}
                >
                  $97 one-time
                </div>
              </div>
              <h3
                className="cond"
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: 14,
                  lineHeight: 1.05,
                }}
              >
                Join the cooperative.
              </h3>
              <p
                style={{
                  color: C.gray,
                  lineHeight: 1.72,
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                No S-Corp required. A one-time purchase that gets you into the
                community, establishes your cooperative ownership, and starts
                your path to Employee Membership.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                  marginBottom: 28,
                  flex: 1,
                }}
              >
                {[
                  "Member Social Hub & peer network",
                  "Internal marketplace for work opportunities",
                  "Educational webinars — S-Corps, taxes & benefits",
                  "Partner discounts on tools & software",
                  "Cooperative governance & profit participation",
                ].map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 14,
                      color: C.lgray,
                    }}
                  >
                    <span
                      style={{ color: C.red, flexShrink: 0, display: "flex", alignItems: "center" }}
                      aria-hidden
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-red btn-fit"
                style={{ padding: "14px 28px", fontSize: 14 }}
              >
                Join the Co-op →
              </a>
            </div>

            <div
              style={{
                background: "rgba(232,67,45,.05)",
                border: `1px solid rgba(232,67,45,.2)`,
                borderRadius: 12,
                padding: 40,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                className="ghost"
                style={{ color: "rgba(232,67,45,.05)" }}
              >
                02
              </span>
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.red,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Employee Membership
                </div>
                <div
                  style={{
                    display: "inline-block",
                    fontSize: 12,
                    fontWeight: 700,
                    background: "rgba(232,67,45,.15)",
                    color: C.red,
                    padding: "4px 12px",
                    borderRadius: 100,
                  }}
                >
                  Full Product
                </div>
              </div>
              <h3
                className="cond"
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: 14,
                  lineHeight: 1.05,
                }}
              >
                The full package.
              </h3>
              <p
                style={{
                  color: C.gray,
                  lineHeight: 1.72,
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                Everything in Community Membership, plus compliant payroll,
                group benefits, and W-2 status — all automated through the
                cooperative. Requires an active S-Corp or C-Corp; we help you
                get set up. Most Members operate as S-Corps.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 9,
                  marginBottom: 28,
                  flex: 1,
                }}
              >
                {[
                  ["Everything in Community Membership", false],
                  ["W-2 employment status", true],
                  ["Semi-monthly payroll — automated & compliant", true],
                  ["Group health, dental, vision, disability & life", true],
                  ["401(k) with employer contribution options", true],
                  ["Unemployment insurance & workers' comp included", true],
                  ["Full tax compliance — withholding, filings & W-2", true],
                  ["S-Corp or C-Corp setup support included", true],
                ].map(([f, bold]) => (
                  <li
                    key={String(f)}
                    style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 14,
                      color: bold ? C.lgray : C.gray,
                    }}
                  >
                    <span
                      style={{ color: C.red, flexShrink: 0, display: "flex", alignItems: "center" }}
                      aria-hidden
                    >
                      <Check size={16} strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link
                  href="/the-cooperative"
                  className="btn-text"
                  style={{ fontSize: 13 }}
                >
                  See how Employee Membership works →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap">
          <span className="slabel">Member Stories</span>
          <h2
            className="cond"
            style={{
              fontSize: "clamp(42px,5vw,70px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.0,
              marginBottom: 52,
            }}
          >
            Real members.
            <br />
            Real outcomes.
          </h2>
          <div className="g2" style={{ marginBottom: 44 }}>
            {[
              {
                q: "Greater benefits and access to payroll. These are the kinds of things you don't necessarily get as a freelancer, owner, or contractor.",
                n: "Yev M.",
                r: "Attorney",
                since: "2021",
              },
              {
                q: "With a recent diagnosis requiring surgery, I was able to access the medical care I needed without the added stress of navigating a complex healthcare system.",
                n: "John D.",
                r: "Nonprofit CEO, Community Development",
                since: "2022",
              },
            ].map((t) => (
              <div
                key={t.n}
                style={{
                  background: "#161616",
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 32,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontSize: 16,
                    color: C.lgray,
                    lineHeight: 1.72,
                    marginBottom: 28,
                  }}
                >
                  &quot;{t.q}&quot;
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    paddingTop: 20,
                    borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <div className="av" style={{ flexShrink: 0 }}>
                    {t.n[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#fff",
                      }}
                    >
                      {t.n}
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.gray, marginTop: 2 }}
                    >
                      {t.r}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#bbb",
                      }}
                    >
                      Member since
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: C.red,
                      }}
                    >
                      {t.since}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap">
          <div
            className="g2"
            style={{ gap: 72, alignItems: "center" }}
          >
            <div>
              <span className="slabel">Who It&apos;s For</span>
              <h2
                className="cond"
                style={{
                  fontSize: "clamp(26px, 3.5vw, 38px)",
                  fontWeight: 800,
                  color: "#fff",
                  lineHeight: 1.2,
                  marginBottom: 18,
                  maxWidth: 520,
                }}
              >
                Independent professionals who&apos;d rather run their business
                than their payroll.
              </h2>
              <p
                style={{
                  color: C.lgray,
                  lineHeight: 1.72,
                  marginBottom: 26,
                  fontSize: 15,
                  maxWidth: 480,
                }}
              >
                Opolis works best for S-Corp operators with stable, recurring
                income. You&apos;re not a customer —{" "}
                <strong style={{ color: "#fff" }}>you&apos;re an owner.</strong>{" "}
                Every Member has a stake in the platform, a voice in governance,
                and access to employment infrastructure that Fortune 500
                employees have taken for granted for decades.
              </p>
              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-red"
                style={{ padding: "13px 28px", fontSize: 14 }}
              >
                Join the Co-op →
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  l: "W-2 employment status",
                  s: "Same documentation as corporate employees",
                },
                {
                  l: "Group benefits purchasing power",
                  s: "Rates that only exist at collective scale",
                },
                {
                  l: "Payroll & tax filings handled",
                  s: "FICA, withholding, 941s, W-2 issuance",
                },
                {
                  l: "Cooperative ownership model",
                  s: "Members own the platform, participate in governance, and share in profits",
                },
              ].map((f) => (
                <div
                  key={f.l}
                  className="dc"
                  style={{
                    padding: "17px 22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#fff",
                        fontSize: 14,
                      }}
                    >
                      {f.l}
                    </div>
                    <div
                      style={{ fontSize: 12, color: C.gray, marginTop: 2 }}
                    >
                      {f.s}
                    </div>
                  </div>
                  <span style={{ color: C.red, display: "flex", alignItems: "center" }} aria-hidden>
                    <Check size={20} strokeWidth={2.5} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="cta-section"
        style={{
          textAlign: "center",
        }}
      >
        <div className="cta-pattern-layer" aria-hidden />
        <div className="wrap">
          <h2
            className="cond"
            style={{
              fontSize: "clamp(42px,6vw,80px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.0,
              marginBottom: 14,
            }}
          >
            Stop going it alone.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,.82)",
              fontSize: 17,
              maxWidth: 560,
              margin: "0 auto 34px",
              lineHeight: 1.68,
            }}
          >
            Over $210M in payroll processed. 1,150+ W-2s issued. A cooperative
            built and owned by the Members who use it — and it gets stronger
            every time someone new joins.
          </p>
          <a
            href={JOIN_URL}
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
