"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { C, COMMUNITY_SIGNUP_URL, STATE_FLOORS, US_STATES } from "@/lib/constants";

const STEPS = [
  { n: 1, l: "Community Membership" },
  { n: 2, l: "Application" },
  { n: 3, l: "Documents" },
  { n: 4, l: "Timeline" },
];

export function JoinContent() {
  const [step, setStep] = useState(0);
  const [ans, setAns] = useState({
    sCorp: "",
    income: "",
    state: "",
    citizen: "",
    goal: "",
  });
  const [elig, setElig] = useState<"fit" | "conditional" | "no" | null>(null);

  const stateFloor = ans.state ? STATE_FLOORS[ans.state] : 43000;
  const incomeVal =
    ans.income === "under43"
      ? 0
      : ans.income === "43to59"
        ? 50000
        : ans.income === "60plus"
          ? 75000
          : -1;

  const check = () => {
    if (!ans.sCorp || !ans.income || !ans.state || !ans.citizen || !ans.goal)
      return;
    const eligible =
      ans.sCorp !== "no" && ans.citizen === "yes" && incomeVal >= stateFloor;
    const conditional =
      ans.sCorp !== "no" &&
      ans.citizen === "yes" &&
      incomeVal > 0 &&
      incomeVal < stateFloor;
    setElig(eligible ? "fit" : conditional ? "conditional" : "no");
    setStep(1);
  };

  return (
    <>
      <section
        className="page-hero page-hero-join"
        style={{
          background: C.black,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <span className="slabel">Get Started</span>
          <h1 className="cond">Join Opolis.</h1>
          <p className="page-hero-lead page-hero-lead--wide">
            The application takes minutes. New Members activate on the 1st of
            each month.
          </p>
        </div>
      </section>

      <section className="sec-dark">
        <div className="wrap">
          <div
            className="join-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "230px 1fr",
              gap: 52,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: 14,
                }}
              >
                Steps
              </div>
              {STEPS.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  className={`jstep${
                    step === i ? " on" : step > i ? " done" : ""
                  }`}
                  onClick={() => step > i && setStep(i)}
                >
                  <div className="jsnum">
                    {step > i ? <Check size={12} strokeWidth={2.5} /> : s.n}
                  </div>
                  {s.l}
                </button>
              ))}
              <div
                style={{
                  marginTop: 28,
                  padding: "18px 20px",
                  background: C.card,
                  borderRadius: 10,
                  border: `1px solid ${C.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: C.red,
                    marginBottom: 7,
                  }}
                >
                  Activation
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: C.gray,
                    lineHeight: 1.7,
                  }}
                >
                  New Members activate on the 1st of each month. Complete
                  onboarding before then to go live that cycle.
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: 44,
                border: `1px solid ${C.lborder}`,
              }}
            >
              {step === 0 && (
                <>
                  <h2
                    className="cond"
                    style={{
                      fontSize: 34,
                      fontWeight: 900,
                      color: "#111",
                      marginBottom: 7,
                    }}
                  >
                    Join the Co-op
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      marginBottom: 32,
                      lineHeight: 1.68,
                      fontSize: 15,
                    }}
                  >
                    Five quick questions to confirm fit. Eligibility varies by
                    state — the form adjusts accordingly.
                  </p>

                  <div style={{ marginBottom: 22 }}>
                    <label
                      style={{
                        display: "block",
                        fontWeight: 600,
                        color: "#111",
                        marginBottom: 9,
                        fontSize: 15,
                      }}
                    >
                      What state is your S-Corp based in?
                    </label>
                    <select
                      className="sel"
                      value={ans.state}
                      onChange={(e) =>
                        setAns((a) => ({ ...a, state: e.target.value }))
                      }
                    >
                      <option value="">Select state…</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {ans.state && (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "10px 14px",
                          background: "rgba(232,67,45,.06)",
                          borderRadius: 7,
                          border: "1px solid rgba(232,67,45,.2)",
                          fontSize: 13,
                          color: "#444",
                        }}
                      >
                        Minimum exempt salary in <strong>{ans.state}</strong>:{" "}
                        <strong style={{ color: C.red }}>
                          $
                          {STATE_FLOORS[ans.state]?.toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>

                  {[
                    {
                      l: "Are you operating (or ready to form) an S-Corporation?",
                      k: "sCorp" as const,
                      opts: [
                        { v: "yes", l: "Yes, I have an active S-Corp" },
                        {
                          v: "forming",
                          l: "Not yet, but I'm ready to form one",
                        },
                        { v: "no", l: "No — I'm not planning to" },
                      ],
                    },
                    {
                      l: `What is your approximate annual contractor income?${
                        ans.state
                          ? ` (${ans.state} minimum: $${
                              STATE_FLOORS[ans.state]?.toLocaleString() ?? ""
                            })`
                          : ""
                      }`,
                      k: "income" as const,
                      opts: [
                        { v: "under43", l: "Under $43,000" },
                        { v: "43to59", l: "$43,000 – $59,999" },
                        { v: "60plus", l: "$60,000+" },
                      ],
                    },
                    {
                      l: "Are you a U.S. citizen or lawful permanent resident?",
                      k: "citizen" as const,
                      opts: [
                        { v: "yes", l: "Yes" },
                        { v: "no", l: "No" },
                      ],
                    },
                    {
                      l: "What's your primary goal?",
                      k: "goal" as const,
                      opts: [
                        { v: "community", l: "Join the community first" },
                        { v: "employee", l: "Get full payroll & benefits" },
                        { v: "explore", l: "Just exploring" },
                      ],
                    },
                  ].map((field) => (
                    <div key={field.k} style={{ marginBottom: 22 }}>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          color: "#111",
                          marginBottom: 9,
                          fontSize: 15,
                        }}
                      >
                        {field.l}
                      </label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {field.opts.map((opt) => (
                          <label
                            key={opt.v}
                            className={`ropt ${
                              ans[field.k] === opt.v ? "sel-on" : ""
                            }`}
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="radio"
                              name={field.k}
                              value={opt.v}
                              checked={ans[field.k] === opt.v}
                              onChange={() =>
                                setAns((a) => ({ ...a, [field.k]: opt.v }))
                              }
                            />
                            {opt.l}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-red"
                    style={{ marginTop: 10 }}
                    onClick={check}
                  >
                    Check eligibility →
                  </button>
                </>
              )}

              {step === 1 && elig && (
                <>
                  <h2
                    className="cond"
                    style={{
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#111",
                      marginBottom: 16,
                    }}
                  >
                    {elig === "fit"
                      ? "You're a strong fit"
                      : elig === "conditional"
                        ? "You may qualify"
                        : "Community Membership is the best place to start"}
                  </h2>
                  <p
                    style={{
                      color: "#666",
                      fontSize: 15,
                      lineHeight: 1.7,
                      marginBottom: 24,
                    }}
                  >
                    {elig === "fit" &&
                      "You meet the typical criteria for Employee Membership. Complete the application to get started."}
                    {elig === "conditional" &&
                      "Your state minimum or income may require a closer look. We recommend starting with Community Membership and scheduling an eligibility conversation."}
                    {elig === "no" &&
                      "Employee Membership requires an S-Corp (or plan to form one), U.S. work authorization, and income meeting your state's minimum. Start with Community Membership to join the cooperative and access resources."}
                  </p>
                  <a
                    href={COMMUNITY_SIGNUP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-red"
                  >
                    Continue to application →
                  </a>
                  <Link
                    href="/resources"
                    className="btn-text"
                    style={{ marginLeft: 16 }}
                  >
                    Read FAQs
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
