"use client";

import { useState } from "react";
import { C } from "@/lib/constants";

const COMMUNITY_POSTS = [
  {
    init: "A",
    name: "Member",
    tag: "Business & Entrepreneurship",
    body: "Excited to connect with fellow independents here. If anyone's working in design or product strategy, let's link up.",
  },
  {
    init: "B",
    name: "Member",
    tag: "Health & Wellness",
    body: "Happy to offer insight to anyone navigating benefits selection for the first time. Feel free to reach out!",
  },
  {
    init: "C",
    name: "Member",
    tag: "Taxes & S-Corps",
    body: "Just finished my first full year as an S-Corp — the salary/distribution split saved me more than I expected.",
  },
] as const;

const MARKETPLACE_SERVICES = [
  { cat: "Legal", title: "Business Contract Review", tags: ["Contract Law", "S-Corp"] },
  { cat: "Finance", title: "S-Corp Tax Strategy & Planning", tags: ["CPA", "Distributions"] },
  { cat: "Design", title: "Brand Identity & Visual Systems", tags: ["Branding", "Logos"] },
  { cat: "Marketing", title: "Content Strategy for Independents", tags: ["SEO", "LinkedIn"] },
  { cat: "Tech", title: "Web & Product Development", tags: ["React", "APIs"] },
  { cat: "Ops", title: "Business Systems & Automation", tags: ["Workflows", "Zapier"] },
  { cat: "Writing", title: "Copywriting & Proposal Drafting", tags: ["Proposals", "Copy"] },
  { cat: "Strategy", title: "Business Development Consulting", tags: ["Growth", "BD"] },
] as const;

const PERK_ITEMS = [
  { name: "Advocacy Partner", desc: "Free membership & advocacy resources for independents" },
  { name: "401(k) Provider", desc: "Retirement planning tools built for independents" },
  { name: "Legal Partner", desc: "Discounted contract review & templates" },
  { name: "Software Suite", desc: "Team tools at individual pricing" },
  { name: "Travel Discount", desc: "Member rates on flights, hotels & coworking spaces" },
] as const;

const PAYROLL_ROWS = [
  { l: "Semi-Monthly Debit", v: "$4,166.67" },
  { l: "Gross Wages", v: "$3,654.27" },
  { l: "Employer Taxes", v: "$452.22" },
  { l: "Benefits Cost", v: "$18.92" },
  { l: "Opolis Fee (1%)", v: "$41.25" },
] as const;

const PAYSTUB_ROWS = [
  { l: "Gross Wages", v: "$3,654.27" },
  { l: "Tax Withholding", v: "-$1,193.63" },
  { l: "HSA", v: "-$0.00" },
] as const;

const CALENDAR_WEEKS: (number | null)[][] = [
  [1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19, 20, 21],
  [22, 23, 24, 25, 26, 27, 28],
  [29, 30, 31, null, null, null, null],
];

const CALENDAR_EVENTS = [
  { date: "3/6", label: "Pay Day", amount: "$4,166.67", dot: "#4ade80" },
  { date: "3/9", label: "Invoices Generated", amount: null as string | null, dot: "#f5c842" },
  { date: "3/11", label: "ACH Draft Open", amount: null as string | null, dot: C.red },
  { date: "3/20", label: "Pay Day", amount: "$4,166.67", dot: "#4ade80" },
  { date: "3/25", label: "ACH Draft Open", amount: null as string | null, dot: C.red },
];

const BENEFIT_PLANS = [
  { tier: "Premium PPO", tag: "PPO", desc: "First-dollar copays, highest coverage tier.", active: false },
  { tier: "Premium HDHP", tag: "PPO", desc: "Lower premiums, HSA-compatible.", active: true },
  { tier: "Value PPO", tag: "PPO", desc: "Straightforward copay, broad network.", active: false },
  { tier: "Value HDHP", tag: "PPO", desc: "Lowest premium, HSA-eligible.", active: false },
] as const;

const BENEFIT_CHIPS = [
  "Dental",
  "Vision",
  "HSA",
  "Life",
  "Disability",
  "Legal",
  "Hospital",
  "Accident",
  "Critical Illness",
] as const;

export function MemberDashboardMockups() {
  const [dashTab, setDashTab] = useState<"Community Member" | "Employee Member">(
    "Community Member",
  );

  return (
    <section className="sec-alt">
      <div className="wrap">
        <span className="slabel">Inside the Portal</span>
        <h2 className="cond h2-section h2-section--page">Your Member dashboard.</h2>
        <p className="section-lead section-lead--narrow" style={{ marginBottom: 28 }}>
          Every Member gets access to the platform on day one. Employee Members unlock the
          full employment stack on top.
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {(["Community Member", "Employee Member"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`tab${dashTab === t ? " on" : ""}`}
              onClick={() => setDashTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {dashTab === "Community Member" ? (
          <div className="member-dash-grid member-dash-grid--community">
            <div className="member-dash-panel">
              <div className="member-dash-panel-head">
                <span className="member-dash-panel-title">Social Hub</span>
                <span style={{ fontSize: 10, color: C.red }}>● Feed</span>
              </div>
              <div className="member-dash-panel-body">
                <div style={{ display: "flex", gap: 6 }}>
                  {["Filter by Topic", "Filter by Tag"].map((f) => (
                    <div
                      key={f}
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#fff",
                        background: C.red,
                        borderRadius: 100,
                        padding: "3px 10px",
                      }}
                    >
                      {f} ▾
                    </div>
                  ))}
                </div>
                {COMMUNITY_POSTS.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: C.red,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {p.init}
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                        <div style={{ fontSize: 9, color: C.gray }}>Opolis Member</div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 9,
                        fontWeight: 700,
                        background: "#222",
                        color: C.lgray,
                        borderRadius: 100,
                        padding: "2px 8px",
                        marginBottom: 5,
                      }}
                    >
                      {p.tag}
                    </div>
                    <p style={{ fontSize: 11, color: C.gray, lineHeight: 1.55 }}>{p.body}</p>
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: C.gray }}>♡ {4 + i}</span>
                      <span style={{ fontSize: 10, color: C.gray }}>◯ {i}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="member-dash-panel">
              <div className="member-dash-panel-head">
                <span className="member-dash-panel-title">Marketplace</span>
                <span style={{ fontSize: 10, color: C.gray }}>Member Services</span>
              </div>
              <div className="member-dash-panel-body" style={{ gap: 9 }}>
                <div
                  style={{
                    fontSize: 10,
                    color: C.gray,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    marginBottom: 2,
                  }}
                >
                  Services offered by members
                </div>
                {MARKETPLACE_SERVICES.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#fff",
                          lineHeight: 1.3,
                        }}
                      >
                        {s.title}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: C.red,
                          background: "rgba(232,67,45,.12)",
                          borderRadius: 100,
                          padding: "2px 7px",
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {s.cat}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {s.tags.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 9,
                            color: C.gray,
                            background: "#222",
                            borderRadius: 100,
                            padding: "2px 7px",
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="member-dash-panel">
              <div className="member-dash-panel-head">
                <span className="member-dash-panel-title">Perks & Rewards</span>
                <span style={{ fontSize: 10, color: "#4ade80" }}>● Active</span>
              </div>
              <div className="member-dash-panel-body" style={{ gap: 8 }}>
                <div
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    marginBottom: 2,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.gray,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      marginBottom: 4,
                    }}
                  >
                    WORK Token Rewards
                  </div>
                  <div className="cond" style={{ fontSize: 28, fontWeight: 900, color: "#4ade80" }}>
                    1,240
                  </div>
                  <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>
                    tokens earned · redeemable in governance
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: C.gray,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    marginBottom: 2,
                  }}
                >
                  Member Perks
                </div>
                {PERK_ITEMS.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      background: C.card,
                      border: `1px solid ${C.border}`,
                      borderRadius: 8,
                      padding: "9px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: C.gray, marginTop: 1 }}>{p.desc}</div>
                    </div>
                    <span style={{ fontSize: 10, color: C.red, fontWeight: 600, flexShrink: 0 }}>
                      Access →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="member-dash-grid member-dash-grid--employee">
            <div className="member-dash-panel">
              <div className="member-dash-panel-head">
                <span className="member-dash-panel-title">Adjust Payroll</span>
                <span style={{ fontSize: 10, color: C.gray }}>Business</span>
              </div>
              <div
                style={{
                  padding: 16,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <div
                      style={{
                        fontSize: 10,
                        color: C.gray,
                        textTransform: "uppercase",
                        letterSpacing: ".08em",
                        marginBottom: 4,
                      }}
                    >
                      Total Annual Payroll
                    </div>
                    <div className="cond" style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
                      $100,000
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.gray,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    S-Corp Invoice
                  </div>
                  {PAYROLL_ROWS.map((r) => (
                    <div
                      key={r.l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      <span style={{ fontSize: 11, color: C.gray }}>{r.l}</span>
                      <span style={{ fontSize: 11, fontWeight: 500, color: C.lgray }}>{r.v}</span>
                    </div>
                  ))}
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: C.gray,
                      letterSpacing: ".1em",
                      textTransform: "uppercase",
                      marginTop: 12,
                      marginBottom: 4,
                    }}
                  >
                    Paystub
                  </div>
                  {PAYSTUB_ROWS.map((r) => (
                    <div
                      key={r.l}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "5px 0",
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      <span style={{ fontSize: 11, color: C.gray }}>{r.l}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color:
                            r.v.startsWith("-") && r.v !== "-$0.00" ? "#f87171" : C.lgray,
                        }}
                      >
                        {r.v}
                      </span>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    background: "rgba(74,222,128,.06)",
                    border: "1px solid rgba(74,222,128,.18)",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 11, color: C.lgray }}>Est. Net Pay</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#4ade80" }}>$2,460.64</span>
                </div>
              </div>
            </div>

            <div className="member-dash-panel">
              <div className="member-dash-panel-head">
                <span className="member-dash-panel-title">Member Dashboard</span>
                <span style={{ fontSize: 10, color: "#4ade80" }}>● Active</span>
              </div>
              <div
                style={{
                  padding: 16,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      color: C.gray,
                      textTransform: "uppercase",
                      letterSpacing: ".08em",
                      marginBottom: 8,
                    }}
                  >
                    March 2026 · Payroll Schedule
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7,1fr)",
                      gap: 2,
                      marginBottom: 2,
                    }}
                  >
                    {(["S", "M", "T", "W", "T", "F", "S"] as const).map((d, i) => (
                      <div
                        key={i}
                        style={{
                          textAlign: "center",
                          fontSize: 9,
                          color: C.gray,
                          fontWeight: 600,
                        }}
                      >
                        {d}
                      </div>
                    ))}
                  </div>
                  {CALENDAR_WEEKS.map((week, wi) => (
                    <div
                      key={wi}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7,1fr)",
                        gap: 2,
                        marginBottom: 2,
                      }}
                    >
                      {week.map((d, di) => {
                        const isPayDay = d === 6 || d === 20;
                        const isACH = d === 11 || d === 25;
                        const isInv = d === 9 || d === 23;
                        const dot = isPayDay ? "#4ade80" : isACH ? C.red : isInv ? "#f5c842" : null;
                        return (
                          <div
                            key={di}
                            style={{
                              textAlign: "center",
                              fontSize: 10,
                              color: isPayDay ? "#fff" : d ? C.gray : "transparent",
                              background: isPayDay ? "#E8432D" : "transparent",
                              borderRadius: 4,
                              padding: "4px 0",
                              fontWeight: isPayDay ? 700 : 400,
                              position: "relative",
                            }}
                          >
                            {d ?? ""}
                            {dot && (
                              <div
                                style={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  background: dot,
                                  position: "absolute",
                                  bottom: 1,
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", marginTop: 8 }}>
                  {CALENDAR_EVENTS.map((e) => (
                    <div
                      key={`${e.date}-${e.label}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: "6px 0",
                        borderTop: `1px solid ${C.border}`,
                      }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: e.dot,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 10, color: C.gray, minWidth: 32 }}>{e.date}</span>
                      <span style={{ fontSize: 11, color: C.lgray, flex: 1 }}>{e.label}</span>
                      {e.amount && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>
                          {e.amount}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="member-dash-panel">
              <div className="member-dash-panel-head">
                <span className="member-dash-panel-title">Benefits</span>
                <span style={{ fontSize: 10, color: C.gray }}>Health Plans</span>
              </div>
              <div
                style={{
                  padding: 16,
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: C.gray,
                    textTransform: "uppercase",
                    letterSpacing: ".08em",
                    marginBottom: 10,
                  }}
                >
                  Available During Enrollment
                </div>
                {BENEFIT_PLANS.map((p) => {
                  const isHdhp = p.tier.includes("HDHP");
                  return (
                  <div
                    key={p.tier}
                    style={{
                      background: p.active ? "rgba(232,67,45,.07)" : "rgba(255,255,255,.03)",
                      border: `1px solid ${p.active ? `${C.red}44` : C.border}`,
                      borderRadius: 8,
                      padding: "9px 11px",
                      marginBottom: 7,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: p.active ? "#fff" : C.lgray,
                        }}
                      >
                        {p.tier}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          background: isHdhp
                            ? "rgba(74,222,128,.12)"
                            : "rgba(255,255,255,.08)",
                          color: isHdhp ? "#4ade80" : C.gray,
                          padding: "2px 7px",
                          borderRadius: 100,
                        }}
                      >
                        {p.tag}
                      </span>
                    </div>
                    <p style={{ fontSize: 10, color: C.gray, lineHeight: 1.5 }}>{p.desc}</p>
                  </div>
                  );
                })}
                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 10,
                    borderTop: `1px solid ${C.border}`,
                    display: "flex",
                    gap: 5,
                    flexWrap: "wrap",
                  }}
                >
                  {BENEFIT_CHIPS.map((b) => (
                    <div
                      key={b}
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        color: C.gray,
                        background: "rgba(255,255,255,.05)",
                        border: `1px solid ${C.border}`,
                        borderRadius: 100,
                        padding: "3px 8px",
                      }}
                    >
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
