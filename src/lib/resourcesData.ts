/**
 * Resources page data: FAQ sections, comparison table, pricing, guides.
 * Matches opollis_vibe App.js Resources + FAQTab.
 * Guides and FAQ can be overridden by WordPress via getGuides() / getFaq() in lib/wordpressResources.ts.
 */

export type FaqItem = { q: string; a: string };
export type FaqSection = { id: string; label: string; items: FaqItem[] };
export type GuidesSection = { cat: string; cc: string; items: { type: string; label: string; url: string }[] };

export const FAQ_SECTIONS: FaqSection[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { q: "What is Opolis?", a: "Opolis is a member-owned employment cooperative that provides payroll, benefits, and W-2 employment infrastructure for independent professionals who run their own businesses. Members keep control of their clients, contracts, and revenue while Opolis runs the employer side of the stack: payroll processing, tax withholding and filings, benefits administration, and employment documentation." },
      { q: "Who is Opolis for?", a: "Opolis is built for independent professionals who operate their own S-Corp or C-Corp and are the primary worker in that business—consultants, contractors, freelancers, and solopreneurs who want a set-and-forget employment stack." },
      { q: "How is Opolis different from a payroll company?", a: "Payroll companies process paychecks, but you still assemble and manage the rest—benefits shopping, employer compliance, and ongoing admin. Opolis bundles the employer infrastructure (payroll + compliance + benefits administration) under a cooperative model designed for single-owner businesses." },
      { q: "How is Opolis different from a PEO?", a: "Many PEOs are designed for businesses with employees and operate through co-employment. Opolis is purpose-built for the solo operator and provides a cooperative employment structure that supports W-2 payroll and access to group benefits." },
      { q: "What's the difference between an EOR and a PEO?", a: "A PEO typically uses a co-employment model: you remain an employer and the PEO provides HR administration. An Employer of Record (EOR) is the legal employer for payroll and benefits administration, responsible for payroll tax compliance and employment obligations associated with that role. Opolis uses this structure to make W-2 employment and group benefits work for independent professionals while Members continue operating their own businesses." },
      { q: "Is Opolis stable and built for the long term?", a: "Yes. Opolis has operated since 2019 and is intentionally run lean and sustainably. The cooperative is funded by straightforward fees (a one-time membership fee and a 1% cooperative fee for Employee Members) rather than a venture-growth SaaS model optimized for consolidation or exit. Credibility (as of March 2026): $210M+ payroll processed and 1,150 W-2s issued (2020–2025)." },
      { q: "What's the catch?", a: "There isn't a \"gotcha\"—it's a different model. You're joining shared infrastructure instead of building it alone. Pricing is transparent: a one-time membership fee to join, and Employee Members pay an ongoing cooperative fee tied to payroll and benefits activity." },
      { q: "How does Opolis actually work?", a: "You run your business normally through your corporation. If you activate Employee Membership, your business funds payroll through Opolis each cycle. Opolis processes payroll, withholds and remits taxes, administers benefits, and issues your W-2. You keep control of your clients and business decisions." },
      { q: "What does Opolis handle vs what do I handle?", a: "Opolis handles: payroll processing and paystubs, federal/state/local payroll withholding and filings, employer-side payroll obligations, benefits administration (enrollment, billing coordination, ongoing administration), workers' comp and unemployment coverage, and W-2 employment documentation. Members handle: client work, contracts, and invoicing, funding payroll from business revenue, business tax filings (e.g., 1120-S) and personal returns (with a CPA as needed), and business decisions (salary level, bonuses, distributions, retained earnings)." },
    ],
  },
  {
    id: "membership",
    label: "Membership & Pricing",
    items: [
      { q: "What are the two membership tiers?", a: "Community Membership ($97 one-time): join the cooperative and access community resources and governance participation. Employee Membership (full product): activates W-2 payroll, benefits access, and employment compliance infrastructure. Requires an S-Corp or C-Corp (or an LLC with S-Corp election). Employee Membership includes a 1% cooperative fee tied to your payroll/benefits activity." },
      { q: "What is a Community Member?", a: "A Community Member has joined the cooperative and has access to community resources and cooperative participation, but has not activated W-2 payroll and benefits through Opolis." },
      { q: "What is an Employee Member?", a: "An Employee Member is a Community Member who has activated Opolis for payroll and benefits. Employee Members receive W-2 pay and access to the Employee Member benefit stack while continuing to run their own business." },
      { q: "What does Employee Membership cost?", a: "Employee Membership is priced as 1% of your payroll invoice total each cycle (gross wages, employer payroll taxes, and elected benefit premiums). For many Members, this works out to roughly $500–$1,000 per year, depending on payroll and benefits elections." },
      { q: "What is a Membership Stake?", a: "A Membership Stake is a deposit equal to approximately one month of your elected benefits premiums, held to reduce the risk of coverage disruption if a payroll cycle is temporarily delayed." },
      { q: "Can I pause or cancel my Employee Membership?", a: "Yes. You can pause or cancel Employee Membership. If payroll stops, W-2 employment and benefits will pause as well. The Membership Stake is held during active membership to protect coverage continuity and is returned upon cancellation per the member agreement terms." },
      { q: "Is Opolis available in my state?", a: "Employee Membership is available across the United States. Payroll compliance and minimums vary by state; Opolis uses state-specific requirements during eligibility and onboarding." },
      { q: "Can I join if I live outside the United States?", a: "Employee Membership (W-2 payroll and U.S. group benefits) is limited to people authorized to work in the U.S. Community Membership may be available to non-U.S. participants, but eligibility can vary—apply and the team will confirm." },
    ],
  },
  {
    id: "getting-started",
    label: "Getting Started",
    items: [
      { q: "What do I need to get started?", a: "Community Membership: $97 and an email. Employee Membership: a qualifying entity, EIN documentation, a business bank account to fund payroll, and a personal bank account for direct deposit." },
      { q: "Do I need a corporation to become an Employee Member?", a: "Yes. Employee Membership requires an S-Corp or C-Corp, or an LLC with an S-Corp election (IRS Form 2553). This structure supports compliant owner-employee payroll and the employment stack Opolis provides." },
      { q: "I only have an LLC. Can I still join?", a: "Yes as a Community Member immediately. To activate Employee Membership, your LLC must elect S-Corp tax status (Form 2553) or otherwise qualify." },
      { q: "Can Opolis help me set up an entity?", a: "Yes. Opolis offers a $299 entity creation service that handles the full setup — LLC Articles of Organization, EIN, and S-Corp election (Form 2553). The process takes about 5 days on average, and includes one free year of Registered Agent service. Always consult a CPA or tax attorney to confirm the right structure for your situation." },
      { q: "Can I use an entity I already have?", a: "Yes, as long as it qualifies (S-Corp, C-Corp, or LLC with S-Corp election) and you have your basic entity documentation." },
      { q: "Does my entity need to be formed in the state where I live?", a: "Not necessarily. Payroll compliance is based on where you live and work. Entity formation strategy is a legal/tax decision—consult a qualified professional for advice." },
      { q: "What documents will I need for Employee Membership?", a: "Commonly required: entity formation/registration document, IRS EIN confirmation, S-Corp election acceptance (if applicable), business bank account info (for funding), personal bank account info (direct deposit), government-issued ID, and IRS Form W-4." },
      { q: "How long does onboarding take?", a: "The application typically takes 30–60 minutes. Activation timing can depend on document readiness and payroll/benefits setup. Many Members target activation on the 1st of a month for clean benefits start dates." },
      { q: "What happens after I apply?", a: "After submitting your application, the Opolis team reviews your documents and entity status. You'll be guided through payroll configuration and benefits enrollment. Most Members complete setup within 2–3 weeks and go live on the 1st of the following month." },
      { q: "Can I talk to someone before applying?", a: "Yes. You can schedule an eligibility conversation to confirm fit before completing onboarding." },
    ],
  },
  {
    id: "payroll",
    label: "Payroll",
    items: [
      { q: "How does payroll work?", a: "Employee Members run payroll on a semi-monthly schedule. Your business funds payroll each cycle, Opolis withholds and remits required taxes and deductions, and deposits net pay to you—like a traditional employer, but you remain the owner of your business." },
      { q: "When does payroll fund and when does it deposit?", a: "Eleven days before pay day, an invoice is generated for your S-Corp. Nine days before pay day, the ACH draft initiates from your business funding account. Net pay deposits on the 1st and 3rd Friday of each month — 24 cycles per year." },
      { q: "How much do I have to pay myself?", a: "You must maintain payroll at or above the minimum required for compliant W-2 employment in your state. Opolis provides state-based guidance during eligibility and onboarding." },
      { q: "What if my income is variable?", a: "You'll need enough funds in your business account to cover each payroll cycle. Many Members keep payroll near the minimum in lean months and add bonuses when revenue is higher." },
      { q: "What's the difference between business revenue and my paycheck?", a: "Revenue goes to your business. Your paycheck is the salary you elect to pay yourself via payroll. Remaining profit may stay in the business for expenses/savings or be taken as distributions, depending on your tax strategy." },
      { q: "Can I receive part of my net pay in crypto?", a: "Members may have the option to route a portion of net pay to supported digital asset rails. Any payroll required to satisfy minimum wage rules must be paid in USD." },
      { q: "Can I set payroll to $0 and keep benefits active?", a: "No. W-2 employment and group benefits require active payroll. If payroll pauses, employment and benefits may need to pause as well. The Membership Stake exists to reduce disruption risk." },
    ],
  },
  {
    id: "benefits",
    label: "Benefits",
    items: [
      { q: "What benefits are available to Employee Members?", a: "Employee Members may access a full suite of group benefits, which can include: medical, dental, and vision; HSA/FSA (where available); 401(k) with employer contribution options; short- and long-term disability; life insurance; workers' compensation and unemployment coverage; optional supplemental coverages (e.g., accident, hospital indemnity, legal). Plan availability and details can vary by state and carrier." },
      { q: "Do I need to enroll in benefits to be an Employee Member?", a: "No. Benefits enrollment is optional — you can use Opolis for W-2 payroll and tax compliance without electing any benefit plans. Many Members join primarily for the employment structure and add benefits over time." },
      { q: "Why are group benefits better than buying individually?", a: "Group benefits are priced and administered through a larger pool, which can improve access, networks, and pricing versus individual-market options for many Members." },
      { q: "When do benefits start?", a: "Benefits typically start on the first day of a month following successful onboarding and activation, depending on carrier and enrollment timelines." },
      { q: "Can I change benefits mid-year?", a: "Generally, changes occur during open enrollment or qualifying life events (marriage, birth/adoption, loss of other coverage, etc.), subject to plan rules." },
      { q: "Why do unemployment and workers' comp matter?", a: "Most independent contractors cannot access these protections. Employee Members participate in unemployment insurance and are covered by workers' compensation—protections usually reserved for traditional employment." },
      { q: "Can Members include crypto in retirement?", a: "Some Members may elect crypto exposure within their retirement allocation where supported by plan options and providers. Availability depends on plan rules." },
    ],
  },
  {
    id: "taxes",
    label: "Taxes",
    items: [
      { q: "What does Opolis handle on the tax side?", a: "Opolis handles payroll withholding, remittance, and payroll filings associated with running W-2 payroll for Employee Members." },
      { q: "What do I receive at year end?", a: "Employee Members receive a W-2 and payroll reporting that supports business bookkeeping and tax preparation. If health coverage applies, you may also receive coverage documentation as required." },
      { q: "Does Opolis file my personal or business tax returns?", a: "No. Your personal return and your business return (e.g., 1120-S and K-1 where applicable) are your responsibility. Most Members use a CPA." },
      { q: "What is a K-1 and do I get one?", a: "A K-1 is a tax form that reports your share of income, deductions, and credits from your S-Corp. Because you own your S-Corp, you will receive a K-1 from your business each year as part of your 1120-S filing. Opolis does not prepare this — your CPA handles it as part of your business return." },
      { q: "Do I still need a CPA?", a: "Most Members do, because entity-level filings and overall strategy go beyond payroll administration." },
      { q: "Do I still pay self-employment tax?", a: "W-2 wages are subject to payroll taxes. With an S-Corp, remaining profit may be distributed without payroll taxes, which is one reason many independent professionals use the S-Corp structure. A CPA can advise on what's appropriate for your situation." },
    ],
  },
  {
    id: "cooperative",
    label: "Cooperative Ownership",
    items: [
      { q: "What is WORK?", a: "WORK is Opolis's patronage tracking system. It records Member participation in the cooperative and is used to calculate proportional entitlement if the cooperative declares a distribution." },
      { q: "Why does Opolis track patronage?", a: "Cooperatives distribute value based on participation. WORK is the mechanism used to measure that participation in a consistent way." },
      { q: "How do Members earn WORK?", a: "Members earn WORK through participation such as payroll activity (Employee Members), referrals, and other cooperative contributions." },
      { q: "Will WORK result in dividends?", a: "Dividends are not guaranteed. If the cooperative generates surplus earnings and the board elects to distribute them, distributions are allocated proportionally based on recorded patronage." },
    ],
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    items: [
      { q: "How does Opolis protect Member data?", a: "Opolis uses industry-standard security practices and encryption to protect sensitive Member data and financial information." },
      { q: "Who has access to my payroll and financial information?", a: "Access is restricted to authorized personnel and service partners who require it to operate payroll, benefits, and related systems." },
    ],
  },
];

export const CMP_ROWS = [
  { f: "W-2 Employment Status", v: ["✓", "✓", "✓", "✓", "✗"] },
  { f: "Group Health Insurance", v: ["✓", "~", "✗", "✓", "✗"] },
  { f: "Employer of Record (shared infra)", v: ["✓", "✗", "✗", "✓", "✗"] },
  { f: "Retirement / 401(k)", v: ["✓", "✓", "✓", "✓", "✗"] },
  { f: "Full Tax Filing & Compliance", v: ["✓", "✓", "✓", "✓", "✗"] },
  { f: "Disability Insurance", v: ["✓", "✗", "✗", "✓", "✗"] },
  { f: "Unemployment Insurance", v: ["✓", "✗", "✗", "✗", "✗"] },
  { f: "Workers' Compensation", v: ["✓", "✗", "✗", "✗", "✗"] },
  { f: "Works Without Hiring Employees", v: ["✓", "✓", "✓", "✓", "✗"] },
  { f: "Cooperative Ownership", v: ["✓", "✗", "✗", "✗", "✗"] },
  { f: "Governance & Profit Participation", v: ["✓", "✗", "✗", "✗", "✗"] },
  { f: "Peer Community & Marketplace", v: ["✓", "✗", "✗", "✗", "✗"] },
];

export const CMP_COLS = [
  "Opolis ✦",
  "Gusto Solo",
  "DIY S-Corp",
  "BeSolo",
  "1099 / Sole Prop",
];

export const PRICING_TIERS = [
  {
    tier: "Co-op Membership",
    price: "$97",
    freq: "one-time",
    badge: null as string | null,
    desc: "Join the cooperative and gain immediate access to the Opolis community.",
    features: [
      "Member Social Hub & peer network",
      "Internal marketplace for work opportunities",
      "Educational webinars on S-Corps, taxes & benefits",
      "Partner discounts on tools and software",
      "Cooperative governance & profit participation",
    ],
    dark: false,
  },
  {
    tier: "Employee Membership",
    price: "~$500–$1K",
    freq: "per year for most Members",
    badge: "Full Product",
    desc: "The full employment infrastructure — payroll, benefits, compliance, and cooperative ownership.",
    sub: "Pricing is 1% of your semi-monthly invoice total (Gross Wages + Employer Taxes + Benefit Premiums × 1%). A one-month premium deposit is required at activation. Example: if your total annual payroll, taxes, and benefits equal $90K, your cooperative fee is $900/year.",
    features: [
      "Everything in Co-op Membership",
      "W-2 employment status",
      "Semi-monthly payroll & full tax compliance",
      "Group health, dental, vision, disability & life",
      "401(k) with employer contribution options",
      "Unemployment insurance & workers' comp included",
    ],
    dark: true,
  },
];

export const GUIDES_DATA: GuidesSection[] = [
  {
    cat: "Entity Creation",
    cc: "#a78bfa",
    items: [
      { type: "Guide", label: "Why set up an entity", url: "https://opolis.co/wp-content/uploads/2023/07/Setting-Up-Your-Business-Entity-Opolis-5.pdf" },
      { type: "Article", label: "Sole Proprietor vs. LLC", url: "https://learn.opolis.co/understanding-the-differences-sole-proprietor-vs-llc/" },
      { type: "Guide", label: "How to create your S-Corp", url: "https://opolis.co/wp-content/uploads/2023/06/How-to-Create-Your-S-Corp-Opolis-1.pdf" },
      { type: "Video", label: "From freelancing to owning your business", url: "https://www.youtube.com/watch?v=4IuprqKfQQ0&t=1s" },
      { type: "Video", label: "Setting up your S-Corp or C-Corp", url: "https://www.youtube.com/watch?v=Izh04QhYfVw" },
    ],
  },
  {
    cat: "Payroll",
    cc: "#E8432D",
    items: [
      { type: "Graphic", label: "How ABC Design gets paid with Opolis", url: "https://opolis.co/wp-content/uploads/2023/05/How-ABC-Design-Gets-Paid-with-Opolis-3.png" },
      { type: "Graphic", label: "How Jen gets a paycheck with Opolis", url: "https://opolis.co/wp-content/uploads/2023/04/How-Jen-Gets-a-Paycheck-from-Opolis-5-x7.png" },
      { type: "Guide", label: "How Opolis works — overview", url: "https://opolis.co/wp-content/uploads/2024/05/Get-Started-With-Opolis-Overview.pdf" },
      { type: "Guide", label: "Minimum earnings requirements by state", url: "https://opolis.co/wp-content/uploads/2025/05/OPOLIS_map_minimum_earning_by_state_BIG_48x62_mid.png" },
    ],
  },
  {
    cat: "Benefits",
    cc: "#4ade80",
    items: [
      { type: "Video", label: "Freelancer benefits: making the right choice", url: "https://www.youtube.com/watch?v=PZehdEsmXXM" },
      { type: "Guide", label: "HSA vs. FSA", url: "https://opolis.co/wp-content/uploads/2023/12/HSA-vs.-FSA_-_updated_12.19.23_V2.pdf" },
      { type: "Guide", label: "Intro to medical plans", url: "https://opolis.co/wp-content/uploads/2023/08/Intro-To-Medical-Plans-2.pdf" },
    ],
  },
  {
    cat: "Taxes",
    cc: "#f5c842",
    items: [
      { type: "Graphic", label: "Tax return checklist", url: "https://opolis.co/wp-content/uploads/2023/08/Tax-Return-Checklist-OPOLIS.png" },
      { type: "Guide", label: "Understanding self-employment taxes", url: "https://learn.opolis.co/understanding-self-employment-taxes-a-comprehensive-guide/" },
      { type: "Guide", label: "Accounting and taxes FAQs", url: "https://opolis.co/getting-started-with-taxes/" },
    ],
  },
  {
    cat: "Cooperative & Rewards",
    cc: "#38bdf8",
    items: [
      { type: "Guide", label: "Simple $WORK FAQ — a guide to Opolis rewards", url: "https://opolis.co/wp-content/uploads/2023/06/WORK-Tokens-A-Guide-to-Opolis-Rewards.pdf" },
      { type: "Whitepaper", label: "Opolis Off-White Paper — The Manifesto that Set Opolis' Vision", url: "https://opolis.co/wp-content/uploads/2021/01/White-paper.pdf" },
      { type: "Whitepaper", label: "Opolis WORK Rewards Whitepaper — The Opolis Economic & Rewards Model", url: "https://docs.google.com/document/d/1YzkD9wtPLFB38xLSbySkQVWiwOkgk_5Hg61fRpdTDl8/edit?tab=t.0#heading=h.dlxgrly3qn05" },
      { type: "Whitepaper", label: "Navigating DAO Legality: LCAs as a Legal Framework", url: "https://opolis.co/wp-content/uploads/2024/02/Opolis_-_DAO_Coop_White_Paper.pdf" },
    ],
  },
];

export const BLOG_CATS = ["All", "Entity Creation", "Benefits", "Taxes", "Payroll", "Rewards"] as const;
export const BLOG_CAT_COLORS: Record<string, string> = {
  "Entity Creation": "#a78bfa",
  "Benefits": "#4ade80",
  "Taxes": "#f5c842",
  "Payroll": "#E8432D",
  "Rewards": "#38bdf8",
};

export function isGuidesSection(x: unknown): x is GuidesSection {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.cat !== "string" || typeof o.cc !== "string") return false;
  if (!Array.isArray(o.items)) return false;
  return o.items.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    return (
      typeof i.type === "string" &&
      typeof i.label === "string" &&
      typeof i.url === "string"
    );
  });
}

export function isFaqSection(x: unknown): x is FaqSection {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.label !== "string") return false;
  if (!Array.isArray(o.items)) return false;
  return o.items.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    return typeof i.q === "string" && typeof i.a === "string";
  });
}
