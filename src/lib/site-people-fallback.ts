/**
 * Static fallback when Firestore has no `people_entries` for a section.
 * Keep in sync with legacy about-page content until CMS is seeded.
 */

export const FALLBACK_BOARD: readonly { n: string; t: string }[] = [
  { n: "John Paller", t: "Chair & Founder" },
  { n: "[Vacant]", t: "Executive Board Member" },
  { n: "Auryn Macmillan", t: "Community Board Member" },
  { n: "Spencer Graham", t: "Community Board Member" },
  { n: "Barry Goers", t: "Board Member" },
  { n: "Felix Machart", t: "Board Member" },
  { n: "[Vacant]", t: "Board Member" },
];

export const FALLBACK_TEAM: readonly { n: string; t: string }[] = [
  { n: "Will Morgan", t: "Executive Steward" },
  { n: "Becky Guinan", t: "Accounting Steward" },
  { n: "Matt Tyus", t: "Payroll & Support Steward" },
  { n: "Robert Hamilton", t: "Accounting Steward" },
  { n: "Danielle Jones", t: "Ops & Admin Steward" },
  { n: "David Jenkins", t: "Membership Steward" },
  { n: "Carlos Londoño", t: "Dev & IT Steward" },
  { n: "Micah Baylor", t: "Insurance & Benefits Steward" },
];
