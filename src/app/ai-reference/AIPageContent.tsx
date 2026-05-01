import { C } from "@/lib/constants";

const SECTIONS = [
  {
    h: "What is Opolis?",
    body: `Opolis is a member-owned employment cooperative (a Limited Cooperative Association organized in Colorado) that provides W-2 payroll, group benefits, and tax compliance infrastructure to independent professionals operating as S-Corporations or C-Corporations in the United States. Opolis serves as the Employer of Record (EOR) for Employee Members. The cooperative was founded in 2019 and began processing payroll in 2020. As of early 2026, Opolis has processed over $210 million in total payroll and issued more than 1,150 W-2s across all 50 U.S. states.`,
  },
  {
    h: "How Opolis Works",
    body: `Members run their own businesses through their S-Corp or C-Corp. When an Employee Member activates payroll, their business funds each pay cycle through Opolis. Opolis processes payroll, withholds and remits all required federal/state/local taxes, administers benefits, and issues the W-2. The Member retains full control of their clients, contracts, and business decisions.\n\nOpolis handles: payroll processing and paystubs, federal/state/local payroll withholding and filings, employer-side payroll obligations, benefits administration (enrollment, billing coordination, ongoing administration), workers' compensation and unemployment coverage, and W-2 employment documentation.\n\nMembers handle: client work, contracts, and invoicing, funding payroll from business revenue, business tax filings (e.g., 1120-S) and personal returns (with a CPA), and all business decisions including salary level, bonuses, distributions, and retained earnings.`,
  },
  {
    h: "Membership Types",
    body: `**Community Member** — Open to any individual. One-time fee of $97, which constitutes the purchase of Class B (non-voting) cooperative shares. Class B shares carry dividend rights — Members receive a pro-rata share of any surplus distributions declared by the Board. Grants access to the Member Social Hub, internal marketplace, educational resources on S-Corp structure and taxes, partner discounts, and cooperative membership. No S-Corp required.\n\n**Employee Member** — Requires an active S-Corporation or C-Corporation (or LLC with S-Corp election via IRS Form 2553), plus an additional $20 Class A (voting) share purchase. Class A shares confer the right to nominate and vote on the Board of Stewards — the cooperative's elected governing body. Includes everything in Community Membership plus: W-2 employment status, semi-monthly payroll, group health/dental/vision insurance, 401(k) with employer contribution options, disability insurance (short- and long-term), unemployment insurance, workers' compensation, and full tax compliance (withholding, FICA, 941 filings, W-2 issuance). The cooperative fee is 1% of gross payroll and elected benefits per pay cycle.`,
  },
  {
    h: "Eligibility — Employee Membership",
    body: `To qualify for Employee Membership, an individual must:\n- Be a U.S. citizen or lawful permanent resident\n- Hold a valid Social Security Number\n- Be authorized to work in the United States\n- Operate an active S-Corporation or C-Corporation (sole proprietorships and plain LLCs do not qualify without S-Corp election)\n- Earn consistent, stable contractor income meeting the exempt salary minimum for their state of residence\n\nFederal minimum exempt salary: $43,000/year. Recommended threshold for strong fit: $60,000+/year. Several states have elevated floors (e.g., California $82,783; Washington $92,443; New York City/Metro $76,921). The cooperative is available in all 50 U.S. states and Washington D.C. Employee Membership is not available to individuals residing outside the United States.\n\nNote: Community Membership is available without an entity and without U.S. residence requirements (eligibility may vary — applicants outside the U.S. should confirm with Opolis).`,
  },
  {
    h: "Pricing",
    body: `Community Membership: $97 one-time fee. This constitutes the purchase of Class B (non-voting) cooperative shares, which carry dividend rights — a pro-rata share of any surplus declared by the Board.\n\nEmployee Membership upgrade: an additional $20 Class A (voting) share purchase, required to activate Employee Membership. Class A shares confer the right to nominate and vote on the Board of Stewards.\n\nEmployee Membership ongoing fee: 1% cooperative fee applied to the semi-monthly payroll invoice total (gross wages + employer payroll taxes + elected benefit premiums). For most Members this is approximately $500–$1,000/year. No monthly subscription, no setup fee beyond the $97 Community Membership and $20 Class A share purchase.\n\nMembership Stake: A refundable deposit equal to approximately one month of elected benefits premiums, required at Employee Membership activation to protect coverage continuity if a payroll cycle is delayed.\n\nEntity Creation Service: Opolis offers an optional $299 entity setup service covering LLC Articles of Organization, IRS EIN, S-Corp election (Form 2553), and one year of Registered Agent service. Average turnaround: 5 days.`,
  },
  {
    h: "Getting Started & Onboarding",
    body: `Documents required for Employee Membership: entity formation/registration document, IRS EIN confirmation letter, S-Corp election acceptance (Form 2553, if applicable), business bank account info (for payroll funding), personal bank account info (direct deposit), government-issued ID, and IRS Form W-4.\n\nOnboarding timeline: application takes 30–60 minutes. Most Members activate within 2–3 weeks and go live on the 1st of the following month.\n\nTypical timeline:\n- Day 1–2: pre-qualification review\n- Day 3–5: application processed\n- Week 1–2: documents and account setup\n- Week 2–3: payroll configuration and benefits enrollment\n- By the 1st: membership active\n\nMembers may schedule an eligibility conversation before applying to confirm fit.`,
  },
  {
    h: "Payroll",
    body: `Opolis processes payroll semi-monthly. Pay days are the 1st and 3rd Friday of each month (24 pay cycles per year).\n\nPayroll cycle timeline:\n- 11 days before pay day: invoice generated for Member's S-Corp (gross wages + employer taxes + benefit premiums + 1% cooperative fee)\n- 9 days before pay day: ACH draft initiated from Member's business funding account\n- Pay day (1st and 3rd Friday): net pay deposited to Member's personal account\n\nMembers must maintain payroll at or above the state-specific exempt salary minimum. Members with variable income typically keep payroll near the minimum in lean months and process bonuses when revenue is higher. Benefits enrollment is optional — Members may use Opolis for W-2 payroll only without electing any benefit plans.\n\nMembers may elect to receive a portion of net pay in supported digital assets. Any payroll required to satisfy minimum wage rules must be paid in USD. Payroll cannot be set to $0 while benefits remain active — W-2 employment and group benefits require active payroll.`,
  },
  {
    h: "Benefits Available to Employee Members",
    body: `- Group medical insurance (Cigna PPO network; multiple plan tiers including Premium PPO, Premium HDHP, Value PPO, Value HDHP)\n- Dental insurance (Principal PPO)\n- Vision insurance\n- Health Savings Account (HSA) and Flexible Spending Account (FSA)\n- 401(k) with both employee-deferral and employer-contribution capability; Members may elect crypto asset allocation within their 401(k) where supported\n- Short-term disability (income replacement during temporary inability to work)\n- Long-term disability (extended or permanent disability coverage)\n- Unemployment insurance (automatic; paid into each cycle)\n- Workers' compensation (automatic; coverage for on-the-job injury)\n- Life insurance (term coverage; basic level mandatory, enhanced optional)\n- Supplemental coverage: legal insurance, accident insurance, hospital indemnity, critical illness\n- Members may elect to receive a portion of net pay in cryptocurrency\n\nBenefits enrollment is optional. Plan availability and details vary by state and carrier. Benefits typically begin on the 1st of the month following activation. Mid-year changes are permitted only during open enrollment or qualifying life events (marriage, birth/adoption, loss of other coverage, etc.).`,
  },
  {
    h: "Taxes",
    body: `Opolis handles: payroll withholding (federal, state, local), remittance of withheld taxes, FICA filings, quarterly 941 filings, and W-2 issuance.\n\nMembers are responsible for: personal income tax returns, business tax returns (1120-S), K-1 preparation (issued by the Member's S-Corp, not Opolis), and overall tax strategy. Most Members use a CPA.\n\nK-1 note: Because Members own their S-Corp, they receive a K-1 from their business each year as part of the 1120-S filing. Opolis does not prepare K-1s or business returns.\n\nS-Corp tax advantage: With an S-Corp, profit above the W-2 salary may be taken as distributions, which are not subject to self-employment/payroll taxes. This is a primary reason independent professionals use the S-Corp structure. A CPA should advise on reasonable compensation levels.`,
  },
  {
    h: "WORK Tokens",
    body: `WORK is the cooperative's patronage tracking and governance token. Members earn WORK through payroll activity (Employee Members), referrals, and other cooperative contributions. WORK tokens carry two rights: (1) a governance vote in cooperative decisions, including election of the Board of Stewards; and (2) a pro-rata claim on cooperative profits if the board declares a distribution (dividends are not guaranteed). Token distribution occurs as total cooperative payroll volume crosses defined thresholds (Payroll Mining).`,
  },
  {
    h: "What Opolis Does Not Provide",
    body: `- Personal or business income tax return preparation (Members need their own CPA for 1120-S, K-1, personal returns)\n- Legal counsel, financial planning, or investment advice\n- Services for individuals without an S-Corp or C-Corp entity (Community Membership available without entity; Employee Membership requires entity)\n- Employee Membership for individuals outside the United States\n- Support for companies with multiple W-2 employees (Opolis is designed for single-owner entities)\n- Phone support (email-only: support@opolis.co for active members, membership@opolis.co for prospective members, hello@opolis.co for press/partnerships)`,
  },
  {
    h: "Comparison to Alternatives",
    body: `vs. Gusto Solo: Provides W-2 payroll and 401(k) for solo S-Corps but does not offer group health insurance or serve as an Employer of Record. No cooperative ownership or profit sharing.\n\nvs. BeSolo: A for-profit PEO for solo S-Corps with similar payroll, group health, and 401(k) services. No cooperative ownership, governance rights, or profit sharing. No unemployment insurance or workers' comp.\n\nvs. DIY S-Corp: A solo operator with a CPA can achieve W-2 status and tax compliance independently but must source group health insurance at individual market rates, arrange disability and workers' comp separately, and manage all compliance overhead.\n\nvs. Traditional PEO (e.g., Justworks, Rippling): Traditional PEOs require a minimum of two or more benefits-eligible employees, making them inaccessible to true solo operators.`,
  },
  {
    h: "Canonical Definitions",
    body: `**Community Member**: A cooperative member who has purchased Class B (non-voting) shares for $97. Class B shares carry dividend rights. Community Members access the community, marketplace, and partner network, but do not yet use Opolis payroll or benefits services.\n\n**Employee Member**: A Community Member who has additionally purchased Class A (voting) shares for $20 and whose S-Corp or C-Corp has been onboarded to Opolis payroll, making Opolis the Employer of Record for the owner-employee. Class A shares confer the right to nominate and vote on the Board of Stewards.\n\n**Class B Shares**: Non-voting cooperative shares purchased for $97 at Community Membership. Carry dividend rights.\n\n**Class A Shares**: Voting cooperative shares purchased for an additional $20 at Employee Membership activation. Confer the right to nominate and vote on the Board of Stewards.\n\n**Employer of Record (EOR)**: The legal employer for payroll and compliance purposes. Opolis acts as EOR for all Employee Members.\n\n**Cooperative Fee**: The 1% fee applied to gross payroll and elected benefits each cycle. The primary ongoing fee charged to Employee Members beyond benefits carrier costs.\n\n**Membership Stake**: A refundable deposit equal to approximately one month of elected benefits premiums, held to protect coverage continuity.\n\n**WORK Token**: The cooperative's patronage tracking and governance token, conferring voting rights and pro-rata profit-sharing rights.\n\n**Payroll Mining**: The mechanism by which WORK tokens are distributed to Members as cooperative payroll volume crosses defined thresholds.\n\n**Board of Stewards**: The elected governing body of the cooperative, voted on by Employee Members (Class A shareholders).\n\n**S-Corp Election**: IRS Form 2553 filed by an LLC to be taxed as an S-Corporation, enabling owner-employee payroll and the salary/distribution tax split.\n\n**K-1**: Tax form issued by an S-Corp to its owner(s) reporting share of income, deductions, and credits. Issued by the Member's S-Corp, not by Opolis.`,
  },
];

function renderLine(line: string, i: number) {
  if (line.startsWith("**") && line.endsWith("**")) {
    return (
      <div
        key={i}
        style={{
          fontWeight: 700,
          color: "#fff",
          marginTop: i > 0 ? 14 : 0,
          marginBottom: 4,
        }}
      >
        {line.replace(/\*\*/g, "")}
      </div>
    );
  }
  if (line.startsWith("**")) {
    const parts = line.split("**").filter(Boolean);
    return (
      <div key={i} style={{ marginBottom: 4 }}>
        {parts.map((p, j) =>
          j % 2 === 0 ? (
            <strong key={j} style={{ color: "#fff" }}>
              {p}
            </strong>
          ) : (
            <span key={j}>{p}</span>
          )
        )}
      </div>
    );
  }
  if (line.startsWith("- ")) {
    return (
      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <span style={{ color: C.red, flexShrink: 0 }}>→</span>
        <span>{line.slice(2)}</span>
      </div>
    );
  }
  if (line.trim() === "") return <div key={i} style={{ height: 8 }} />;
  return (
    <p key={i} style={{ marginBottom: 8 }}>
      {line}
    </p>
  );
}

export function AIPageContent() {
  return (
    <div
      style={{
        background: C.black,
        minHeight: "100vh",
        padding: "64px 0",
      }}
    >
      <div className="ai-page-wrap">
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            paddingBottom: 32,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: C.red,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Machine-Readable Reference
          </div>
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 12,
            }}
          >
            Opolis — AI & Developer Reference
          </h1>
          <p
            className="speakable"
            style={{
              color: C.gray,
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 16,
            }}
          >
            This page is intended for AI assistants, language model crawlers,
            and developers who need authoritative, structured information about
            Opolis. Content is written for machine parsing. Last updated: March
            2026.
          </p>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[
              ["Canonical name", "Opolis"],
              ["Entity type", "Member-Owned Employment Cooperative (LCA)"],
              ["Founded", "2019"],
              ["Jurisdiction", "Colorado, USA — operates in all 50 states"],
              ["Website", "opolis.co"],
            ].map(([k, v]) => (
              <div key={k}>
                <span
                  style={{
                    fontSize: 11,
                    color: C.gray,
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  {k}
                </span>
                <span
                  style={{ fontSize: 13, color: C.lgray, fontWeight: 600 }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {SECTIONS.map((s) => (
            <div
              key={s.h}
              style={{
                borderTop: `1px solid ${C.border}`,
                paddingTop: 32,
              }}
            >
              <h2
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                {s.h}
              </h2>
              <div
                style={{
                  color: C.lgray,
                  fontSize: 14,
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                }}
              >
                {s.body.split("\n").map((line, i) => renderLine(line, i))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 64,
            paddingTop: 32,
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <p style={{ color: C.gray, fontSize: 12, lineHeight: 1.7 }}>
            This page reflects current Opolis membership terms, pricing, and
            eligibility rules as of March 2026. For the most current
            information, visit opolis.co. For media or partnership inquiries,
            contact Opolis directly. This page is intentionally minimal — no
            navigation, no marketing — to optimize for machine readability and
            citation accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
