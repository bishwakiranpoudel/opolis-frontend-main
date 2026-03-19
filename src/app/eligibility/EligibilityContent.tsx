"use client";

import { useState } from "react";
import Link from "next/link";
import { C, STATE_FLOORS, US_STATES } from "@/lib/constants";
import {
  Users,
  BookOpen,
  Vote,
  ShoppingBag,
  Briefcase,
  Coins,
  Settings,
  TrendingUp,
  Handshake,
  Check,
} from "lucide-react";

const JOIN_URL = "https://commons.opolis.co/coalition/webinarspecial";

export function EligibilityContent() {
  const [selectedState, setSelectedState] = useState("");
  const floor = selectedState ? STATE_FLOORS[selectedState] : null;
  const fmt = (n: number) => "$" + n.toLocaleString();

  return (
    <>
      <section
        className="page-hero"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="o-pattern"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            pointerEvents: "none",
          }}
        />
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <span className="slabel">Eligibility</span>
          <h1
            className="cond"
            style={{
              fontSize: "clamp(54px,7vw,96px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 0.94,
              marginBottom: 22,
            }}
          >
            Is Opolis
            <br />
            <span style={{ color: C.red }}>right for you?</span>
          </h1>
          <p
            style={{
              color: C.gray,
              fontSize: 17,
              maxWidth: 580,
              lineHeight: 1.68,
            }}
          >
            The cooperative works best for a specific kind of professional.
            Being honest about fit is part of how we keep it working for
            everyone.
          </p>
        </div>
      </section>

      <section
        style={{
          background: C.dark,
          padding: "72px 0",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="wrap">
          <div
            className="eligibility-intro-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "300px 1fr",
              gap: 64,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.red,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Community Membership
              </div>
              <h2
                className="cond"
                style={{
                  fontSize: "clamp(34px,4vw,54px)",
                  fontWeight: 900,
                  color: "#fff",
                  lineHeight: 1.05,
                  marginBottom: 14,
                }}
              >
                Open to everyone.
                <br />
                <span style={{ color: C.red }}>$97, one time.</span>
              </h2>
              <p
                style={{
                  color: C.gray,
                  fontSize: 14,
                  lineHeight: 1.72,
                  marginBottom: 22,
                }}
              >
                No S-Corp required. Join the cooperative, access the community,
                and start the path to Employee Membership when you&apos;re
                ready.
              </p>
              <a
                href={JOIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-red"
                style={{ padding: "12px 26px", fontSize: 14 }}
              >
                Join the Co-op →
              </a>
            </div>
            <div
              className="eligibility-cards-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 10,
              }}
            >
              {[
                { Icon: Users, h: "Member Social Hub", p: "Peer network, knowledge sharing, collaborators." },
                { Icon: BookOpen, h: "Education & Resources", p: "Webinars on S-Corps, taxes, and benefits." },
                { Icon: Vote, h: "Governance & Profits", p: "Members participate in cooperative governance and profit distributions." },
                { Icon: ShoppingBag, h: "Partner Discounts", p: "Tools and services negotiated for Members." },
                { Icon: Briefcase, h: "Internal Marketplace", p: "Members-only work opportunities." },
                { Icon: Coins, h: "Member Rewards", p: "Members earn rewards as the cooperative grows, deepening their ownership stake." },
              ].map(({ Icon, h, p }) => (
                <div
                  key={h}
                  className="dc"
                  style={{ padding: "14px 16px" }}
                >
                  <span
                    className="ibox"
                    style={{ marginBottom: 7, color: C.red }}
                    aria-hidden
                  >
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <div
                    style={{
                      fontWeight: 700,
                      color: "#fff",
                      fontSize: 13,
                      marginBottom: 4,
                    }}
                  >
                    {h}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: C.gray,
                      lineHeight: 1.5,
                    }}
                  >
                    {p}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.red,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Employee Membership
            </div>
            <h2
              className="cond"
              style={{
                fontSize: "clamp(34px,4vw,54px)",
                fontWeight: 900,
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Who qualifies.
            </h2>
            <p
              style={{
                color: C.gray,
                fontSize: 14,
                lineHeight: 1.72,
                maxWidth: 640,
              }}
            >
              Employee Membership is the full employment stack — payroll,
              benefits, compliance, W-2. It requires an active S-Corp or C-Corp
              and a salary that meets your state&apos;s exempt minimum.
              Community Members upgrade when they&apos;re ready.
            </p>
          </div>

          {/* Ideal profiles — compact */}
          <div className="g3" style={{ marginBottom: 48 }}>
            {[
              { Icon: Settings, h: '"Set-and-forget" operators', p: "Excellent at the work, no interest in becoming a payroll expert. The infrastructure runs automatically every month." },
              { Icon: TrendingUp, h: "Stable contractor income", p: "Consistent, recurring income meeting your state's exempt salary minimum — at least $43K federally, $60K+ for strong fit." },
              { Icon: Handshake, h: "Community-minded independents", p: "Opolis is a cooperative. Members share infrastructure, participate in governance, and benefit from the platform they collectively own." },
            ].map(({ Icon, h, p }) => (
              <div key={h} className="dc" style={{ padding: "22px 20px" }}>
                <span className="ibox" style={{ marginBottom: 10, color: C.red }} aria-hidden>
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                >
                  {h}
                </h3>
                <p style={{ color: C.gray, lineHeight: 1.6, fontSize: 13 }}>
                  {p}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.red,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            Income & Requirements
          </div>

          {/* Income spectrum + state lookup — full width single blade */}
          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "28px 32px",
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: C.lgray,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Annual Income Eligibility
              </div>
              <div
                style={{
                  position: "relative",
                  height: 10,
                  borderRadius: 100,
                  background:
                    "linear-gradient(to right, #E84040 0%, #E84040 28%, #f5c842 28%, #f5c842 52%, #4ade80 52%, #4ade80 100%)",
                  marginBottom: 8,
                }}
              />
              <div
                className="income-labels-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "28fr 24fr 48fr",
                  fontSize: 11,
                  color: C.gray,
                  marginBottom: 16,
                }}
              >
                <div style={{ color: "#E84040", fontWeight: 700 }}>
                  Under $43K
                </div>
                <div
                  style={{
                    color: "#f5c842",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  $43K – $59,999
                </div>
                <div
                  style={{
                    color: "#4ade80",
                    fontWeight: 700,
                    textAlign: "right",
                  }}
                >
                  $60K+
                </div>
              </div>
              <div
                className="income-cards-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "28fr 24fr 48fr",
                  gap: 8,
                }}
              >
                {[
                  {
                    label: "Under $43K",
                    note: "Not eligible",
                    c: "rgba(232,64,64,.12)",
                    border: "rgba(232,64,64,.25)",
                    text: "#E84040",
                  },
                  {
                    label: "$43K – $59,999",
                    note: "Possible — state floors matter",
                    c: "rgba(245,200,66,.08)",
                    border: "rgba(245,200,66,.3)",
                    text: "#f5c842",
                  },
                  {
                    label: "$60K+",
                    note: "Likely eligible — strong fit",
                    c: "rgba(74,222,128,.08)",
                    border: "rgba(74,222,128,.25)",
                    text: "#4ade80",
                  },
                ].map((r) => (
                  <div
                    key={r.label}
                    style={{
                      background: r.c,
                      border: `1px solid ${r.border}`,
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      className="cond"
                      style={{
                        fontWeight: 900,
                        color: "#fff",
                        fontSize: 15,
                        marginBottom: 2,
                      }}
                    >
                      {r.label}
                    </div>
                    <div style={{ fontSize: 11, color: r.text }}>{r.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderTop: `1px solid ${C.border}`,
                marginBottom: 24,
              }}
            />

            {/* State lookup — 3 columns */}
            <div
              className="eligibility-state-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
                alignItems: "start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.lgray,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Your state
                </div>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="sel"
                  style={{
                    background: C.dark,
                    color: selectedState ? "#fff" : C.gray,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <option value="">Select state…</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.lgray,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Minimum Exempt Salary +<br />
                  Employer Taxes
                </div>
                {floor ? (
                  <div>
                    <div
                      className="cond"
                      style={{
                        fontSize: 32,
                        fontWeight: 900,
                        color: C.red,
                        lineHeight: 1,
                      }}
                    >
                      {fmt(floor)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: C.gray,
                        marginTop: 4,
                      }}
                    >
                      exempt salary floor in {selectedState}
                    </div>
                    <div
                      style={{ fontSize: 11, color: C.gray, marginTop: 2 }}
                    >
                      + employer taxes on top
                    </div>
                  </div>
                ) : (
                  <div
                    className="cond"
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: C.border,
                    }}
                  >
                    —
                  </div>
                )}
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.lgray,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  Strong fit threshold
                </div>
                <div
                  className="cond"
                  style={{
                    fontSize: 32,
                    fontWeight: 900,
                    color: "#4ade80",
                    lineHeight: 1,
                  }}
                >
                  {floor && floor > 60000 ? fmt(floor) : "$60,000"}+
                </div>
                <div
                  style={{ fontSize: 11, color: C.gray, marginTop: 4 }}
                >
                  where S-Corp structure compounds
                </div>
                {floor && floor > 60000 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#f5c842",
                      marginTop: 6,
                    }}
                  >
                    ⚠ {selectedState} floor is elevated
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: "12px 16px",
                background: "rgba(232,67,45,.06)",
                border: "1px solid rgba(232,67,45,.18)",
                borderRadius: 8,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: C.lgray,
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                <strong style={{ color: "#fff" }}>
                  Benefits are billed in addition to payroll.
                </strong>{" "}
                The minimum above covers exempt salary + employer taxes only.
                Electing health, dental, vision, or other benefits increases
                your monthly invoice accordingly. Plan your S-Corp salary with
                total cost in mind.
              </p>
            </div>
          </div>

          {/* Requirements checklist */}
          <div
            className="eligibility-requirements-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5,1fr)",
              gap: 9,
            }}
          >
            {[
              "U.S. citizen or lawful permanent resident",
              "Valid Social Security Number",
              "Active S-Corp or C-Corp (or LLC with S-Corp election)",
              "Stable contractor income meeting state minimum",
              "Business + personal bank accounts",
            ].map((req) => (
              <div
                key={req}
                className="dc"
                style={{
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ color: C.red, display: "flex", alignItems: "center" }} aria-hidden>
                  <Check size={16} strokeWidth={2.5} />
                </span>
                <span style={{ fontSize: 13, color: C.lgray }}>{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2
            className="cond"
            style={{
              fontSize: "clamp(34px,4vw,52px)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Ready to join?
          </h2>
          <p
            style={{
              color: C.gray,
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 24,
              maxWidth: 520,
              margin: "0 auto 24px",
            }}
          >
            Start with Community Membership for $97, or go straight to
            Employee Membership if you have an S-Corp ready.
          </p>
          <div
            className="cta-buttons-row"
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a
              href={JOIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-red"
            >
              Join the Co-op →
            </a>
            <Link href="/resources" className="btn-outline">
              FAQs & Resources
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
