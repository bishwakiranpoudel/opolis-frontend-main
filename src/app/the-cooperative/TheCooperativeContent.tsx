"use client";

import { useState } from "react";
import Link from "next/link";
import { C } from "@/lib/constants";

const JOIN_URL = "https://commons.opolis.co/coalition/webinarspecial";

export function TheCooperativeContent() {
  const [dashTab, setDashTab] = useState<"Community Member" | "Employee Member">("Community Member");

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
          <span className="slabel">The Cooperative</span>
          <h1 className="cond">
            How It
            <br />
            <span style={{ color: C.red }}>Works.</span>
          </h1>
          <p className="page-hero-lead">
            Two membership tiers. One cooperative. Start in minutes — upgrade
            when you&apos;re ready for the full employment stack.
          </p>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              borderRadius: 14,
              overflow: "hidden",
              border: `1px solid ${C.border}`,
            }}
          >
            <div className="coop-step-block" style={{ background: C.card, padding: "32px 48px" }}>
              <div
                className="coop-two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 48,
                  alignItems: "center",
                }}
              >
                <div>
                  <span className="kicker">Step 1 — For Everyone</span>
                  <h2 className="cond h2-section h2-section--static-42">
                    Community Membership
                  </h2>
                  <div className="section-meta">
                    $97 one-time · ~2 minutes
                  </div>
                  <p
                    className="section-lead section-lead--narrow"
                    style={{ marginBottom: 20 }}
                  >
                    Join immediately. No S-Corp required. Access the Member
                    community, educational resources, and partner discounts —
                    and participate in cooperative governance and profit sharing
                    as a co-owner.
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
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {[
                    "Member Social Hub & peer network",
                    "Internal marketplace for work opportunities",
                    "Educational webinars on S-Corps, taxes & benefits",
                    "Partner discounts on tools & software",
                    "Cooperative governance & profit participation",
                  ].map((f) => (
                    <div key={f} className="chkli">
                      <span className="arr">→</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="coop-step-block"
              style={{
                background: "rgba(232,67,45,.05)",
                borderTop: "1px solid rgba(232,67,45,.2)",
                padding: "32px 48px",
              }}
            >
              <div
                className="coop-two-col"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 48,
                  alignItems: "center",
                }}
              >
                <div>
                  <span className="kicker">Step 2 — Employee Members Only</span>
                  <h2 className="cond h2-section h2-section--static-42">
                    Employee Membership
                  </h2>
                  <div className="section-meta">
                    Requires active S-Corp or C-Corp · 30–60 min onboarding
                  </div>
                  <p
                    className="section-lead section-lead--narrow"
                    style={{ marginBottom: 20 }}
                  >
                    The full employment stack. Opolis becomes your
                    employer-of-record for payroll purposes only — your clients,
                    hours, rates, and worksite stay entirely yours.
                  </p>
                  <Link
                    href="/eligibility"
                    className="btn-text"
                    style={{ fontSize: 13 }}
                  >
                    Check eligibility →
                  </Link>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {[
                    "W-2 employment status",
                    "Semi-monthly payroll — automated & compliant",
                    "Group health, dental, vision, disability & life",
                    "401(k) with employer contribution options",
                    "Unemployment insurance & workers' comp included",
                    "Full tax compliance — withholding, filings & W-2",
                    "Everything in Community Membership",
                  ].map((f) => (
                    <div key={f} className="chkli">
                      <span className="arr">→</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap">
          <span className="slabel">Monthly Workflow</span>
          <h2 className="cond h2-section h2-section--page">
            A month as an Employee Member.
          </h2>
          <p
            className="section-lead section-lead--narrow"
            style={{ marginBottom: 32 }}
          >
            Your salary is divided across 24 semi-monthly cycles. Each invoice
            covers Gross Wages, Employer Taxes, Benefit Premiums, and the 1%
            cooperative fee.
          </p>
          <div
            className="workflow-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
            }}
          >
            {[
              {
                n: "1",
                h: "Invoice clients",
                d: "Bill normally through your S-Corp. Your hours, clients, rates, and worksite are entirely yours — Opolis handles the employer-of-record payroll infrastructure.",
              },
              {
                n: "2",
                h: "Invoice & payment automated",
                d: "Opolis sends a semi-monthly invoice to your S-Corp and the ACH drafts automatically. Members can also fund payroll from crypto income.",
              },
              {
                n: "3",
                h: "Opolis processes payroll",
                d: "Federal, state, and local taxes withheld. Benefit premiums and the 1% co-op fee deducted. Net pay calculated.",
              },
              {
                n: "4",
                h: "Net pay deposited",
                d: "Direct deposit on the 1st and 3rd Friday of every month. Members may elect to receive a portion in crypto. Benefits run automatically in the background.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="dc"
                style={{ textAlign: "center", padding: "20px 18px" }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: C.red,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 15,
                    margin: "0 auto 10px",
                  }}
                >
                  {s.n}
                </div>
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {s.h}
                </h3>
                <p style={{ fontSize: 12, color: C.gray, lineHeight: 1.6 }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              padding: "16px 22px",
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
            }}
          >
            <p style={{ color: C.lgray, fontSize: 13, lineHeight: 1.7 }}>
              <strong style={{ color: "#fff" }}>Bonus paychecks:</strong>{" "}
              Members can schedule up to 24 additional payroll runs per year on
              demand.
            </p>
          </div>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          <span className="slabel">Inside the Portal</span>
          <h2 className="cond h2-section h2-section--page">
            Your Member dashboard.
          </h2>
          <p className="section-lead section-lead--narrow">
            Every Member gets access to the platform on day one. Employee
            Members unlock the full employment stack on top.
          </p>

          <div className="u-mb-block" style={{ display: "flex", gap: 6 }}>
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

          <div
            style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 32,
              minHeight: 280,
            }}
          >
            <p style={{ color: C.lgray, fontSize: 14, lineHeight: 1.7 }}>
              {dashTab === "Community Member"
                ? "Community Members see the Social Hub, Marketplace, Perks & Rewards, and governance tools. Employee Members additionally see Payroll, Benefits, and Tax documents."
                : "Employee Members see everything in Community plus: semi-monthly paystubs, benefits enrollment, W-2 and tax documents, and payroll history."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
