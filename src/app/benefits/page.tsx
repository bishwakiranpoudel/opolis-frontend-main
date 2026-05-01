import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { C, COMMUNITY_SIGNUP_URL, SITE_URL } from "@/lib/constants";
import {
  Heart,
  TrendingUp,
  Shield,
  PlusCircle,
  FileText,
  Globe,
  Check,
} from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "Benefits — Full Benefits Package for Employee Members | Opolis",
  description:
    "Group health, dental, vision, 401(k), disability, life insurance, workers' comp, and unemployment. Employee Members get the same benefits infrastructure as large employers.",
  path: "/benefits",
});

const BENEFITS = [
  {
    Icon: Heart,
    h: "Health Insurance",
    badge: "Most Popular",
    d: "Group medical, dental, and vision plans from national carriers. Multiple tiers — from high-deductible HSA-compatible plans to comprehensive PPOs.",
    pts: [
      "Medical, dental, and vision from national carriers",
      "Multiple plan tiers to match your needs and budget",
      "Coverage for Member and eligible dependents",
      "Premiums coordinated through payroll",
    ],
  },
  {
    Icon: TrendingUp,
    h: "Retirement",
    d: "S-Corp owner-employee retirement plans with the ability to contribute as both employee and employer — significantly increasing annual contribution limits.",
    pts: [
      "401(k) with flexible contribution levels",
      "Employer contribution capability through your S-Corp",
      "Roth and traditional options depending on plan",
      "Contributions automated through payroll",
    ],
  },
  {
    Icon: Shield,
    h: "Disability & Income Protection",
    badge: "Often Overlooked",
    d: "As a W-2 employee of the cooperative, you gain access to protections most independent professionals have never had.",
    pts: [
      "Short-term disability — 60% of base salary replacement",
      "Long-term disability — extended or permanent coverage",
      "Unemployment insurance — temporary income replacement",
      "Workers' compensation — on-the-job injury coverage",
    ],
  },
  {
    Icon: PlusCircle,
    h: "Supplemental Coverage",
    d: "Round out your protection with supplemental options available through the cooperative.",
    pts: [
      "Legal insurance — personal and business matters",
      "Accident insurance — lump-sum for covered injuries",
      "Hospital indemnity — direct cash for covered stays",
      "Life insurance — term coverage for your family",
    ],
  },
  {
    Icon: FileText,
    h: "W-2 Employment Documentation",
    badge: "Opens Doors",
    d: "The W-2 is more than a tax document — it's proof of employment required for mortgages, apartment rentals, car loans, and financial products.",
    pts: [
      "Qualifies Members for mortgages and housing",
      "Access to financial products requiring employment verification",
      "Same documentation that full-time corporate employees receive",
    ],
  },
  {
    Icon: Globe,
    h: "Community & Perks",
    d: "Independent doesn't mean isolated. The Opolis cooperative connects professionals across all 50 states with a growing suite of partner benefits.",
    pts: [
      "Member Social Hub — peer connection, knowledge sharing",
      "Educational webinars on S-Corps, tax strategy, and benefits",
      "Partner discounts on tools, software, and professional services",
      "Community events — virtual and in-person",
    ],
  },
];

const benefitsBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Benefits", path: "/benefits" },
]);
const benefitsWebPageLd = webPageJsonLd({
  name: "Benefits — Full Benefits Package for Employee Members | Opolis",
  description:
    "Group health, dental, vision, 401(k), disability, life insurance, workers' comp, and unemployment. Employee Members get the same benefits infrastructure as large employers.",
  url: `${SITE_URL}/benefits`,
  speakableCssSelectors: [".speakable"],
});

export default function BenefitsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(benefitsBreadcrumb),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(benefitsWebPageLd),
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
          <span className="slabel">What the Cooperative Unlocks</span>
          <h1 className="cond">
            The full
            <br />
            <span style={{ color: C.red }}>benefits package.</span>
          </h1>
          <p className="page-hero-lead page-hero-lead--wide speakable">
            Group benefits aren&apos;t a perk of the cooperative — they&apos;re
            the reason it exists. The rates, the access, the coverage options:
            none of it would be possible for a solo professional. All of it
            becomes possible at the scale of a cooperative membership negotiating
            as one employer — with over $210M in payroll processed to date.
          </p>
        </div>
      </section>

      <section
        className="sec-after-hero-cta"
        style={{
          background: C.card,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          padding: "20px 0",
        }}
      >
        <div
          className="wrap benefits-cta-bar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <p style={{ color: C.lgray, fontSize: 15, margin: 0 }}>
            All benefits are available to{" "}
            <strong style={{ color: "#fff" }}>Employee Members</strong> — start
            with a Community Membership for $97.
          </p>
          <a
            href={COMMUNITY_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-red"
            style={{ padding: "11px 24px", fontSize: 13, flexShrink: 0 }}
          >
            Join the Co-op →
          </a>
        </div>
      </section>

      <section className="sec-alt">
        <div className="wrap">
          <div className="g2">
            {BENEFITS.map((b) => (
              <div
                key={b.h}
                className="dc"
                style={{ position: "relative" }}
              >
                {b.badge && (
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
                      borderRadius: "100px",
                      textTransform: "uppercase",
                    }}
                  >
                    {b.badge}
                  </div>
                )}
                <div className="ibox" aria-hidden>
                  <b.Icon size={20} strokeWidth={1.8} />
                </div>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 10,
                  }}
                >
                  {b.h}
                </h3>
                <p
                  style={{
                    color: C.gray,
                    fontSize: 14,
                    lineHeight: 1.7,
                    marginBottom: 16,
                  }}
                >
                  {b.d}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {b.pts.map((pt) => (
                    <li
                      key={pt}
                      style={{
                        display: "flex",
                        gap: 8,
                        fontSize: 13,
                        color: C.lgray,
                        marginBottom: 6,
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ color: C.red, flexShrink: 0, marginTop: 2 }} aria-hidden>
                        <Check size={14} strokeWidth={2.5} />
                      </span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
        <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
          <h2
            className="cond"
            style={{
              fontSize: "clamp(42px, 6vw, 80px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.0,
              marginBottom: 14,
            }}
          >
            Membership pays for itself.
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.82)",
              fontSize: 17,
              maxWidth: 560,
              margin: "0 auto 34px",
              lineHeight: 1.68,
            }}
          >
            For most Members, the group health rates alone more than justify
            the cost of membership.
          </p>
          <a
            href={COMMUNITY_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wht lg"
          >
            Join the Co-op →
          </a>
        </div>
      </section>

      <section className="sec-dark" id="benefits-cta">
        <div className="wrap">
          <div className="section-cta-stack section-cta-stack--measure-sm">
            <h2 className="cond h2-section h2-section--page" id="ready-for-full-stack">
              Ready for the full stack?
            </h2>
            <p className="section-lead section-lead--center">
              Join as a Community Member first, or apply for Employee Membership
              if you already run an S-Corp.
            </p>
            <a
              href={COMMUNITY_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-red lg"
            >
              Join the Co-op →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
