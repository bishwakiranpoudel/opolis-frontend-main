/**
 * Opolis design tokens and shared data
 */

export const C = {
  black: "#0D0D0D",
  dark: "#111111",
  card: "#181818",
  border: "#252525",
  white: "#FFFFFF",
  lgray: "#C8C8C8",
  gray: "#777777",
  red: "#E8432D",
  light: "#F4F3EF",
  lborder: "#E4E4E0",
} as const;

export const STATE_FLOORS: Record<string, number> = {
  Alabama: 43000,
  Alaska: 60976,
  Arizona: 43000,
  Arkansas: 43000,
  California: 82783,
  Colorado: 67253,
  Connecticut: 43000,
  Delaware: 43000,
  Florida: 43000,
  Georgia: 43000,
  Hawaii: 43000,
  Idaho: 43000,
  Illinois: 43000,
  Indiana: 43000,
  Iowa: 43000,
  Kansas: 43000,
  Kentucky: 43000,
  Louisiana: 43000,
  Maine: 52132,
  Maryland: 43000,
  Massachusetts: 43090,
  Michigan: 43000,
  Minnesota: 43000,
  Mississippi: 43000,
  Missouri: 43000,
  Montana: 43000,
  Nebraska: 43000,
  Nevada: 43000,
  "New Hampshire": 43000,
  "New Jersey": 43000,
  "New Mexico": 43000,
  "New York (NYC & Metro)": 76921,
  "New York (Rest of State)": 71301,
  "North Carolina": 43000,
  "North Dakota": 43000,
  Ohio: 43000,
  Oklahoma: 43000,
  Oregon: 43132,
  Pennsylvania: 43000,
  "Rhode Island": 44758,
  "South Carolina": 43000,
  "South Dakota": 43000,
  Tennessee: 43000,
  Texas: 43000,
  Utah: 43000,
  Vermont: 43000,
  Virginia: 43000,
  Washington: 92443,
  "Washington D.C.": 43000,
  "West Virginia": 43000,
  Wisconsin: 43000,
  Wyoming: 43000,
};

export const US_STATES = Object.keys(STATE_FLOORS).sort();

/**
 * Canonical origin, no trailing slash.
 * - Prefer `NEXT_PUBLIC_SITE_URL` (set in Vercel prod to https://opolis.co).
 * - On Vercel *preview* builds only, fall back to `VERCEL_URL` so audits on
 *   *.vercel.app match canonicals and JSON-LD.
 * - Production without explicit env stays on opolis.co (never *.vercel.app).
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercelEnv = process.env.VERCEL_ENV;
  const isPreview = vercelEnv === "preview" || vercelEnv === "development";
  const vercel = process.env.VERCEL_URL?.trim();
  if (isPreview && vercel) {
    const host = vercel.replace(/^https?:\/\//i, "");
    return `https://${host}`.replace(/\/$/, "");
  }
  return "https://opolis.co";
}

export const SITE_URL = resolveSiteUrl();

/**
 * Unemployable in-show “Season 2” if publish date is on/after this instant and no
 * explicit S1/S2 WordPress category matched. Override with UNEMPLOYABLE_SEASON2_START_ISO (ISO 8601).
 */
export function unemployableSeasonTwoStartIso(): string {
  const raw = process.env.UNEMPLOYABLE_SEASON2_START_ISO?.trim();
  return raw || "2024-06-01T00:00:00.000Z";
}

/** Optional WP category ids that tag Unemployable S1 / S2 (numeric strings). */
export function unemployableSeasonWpCategoryIds(): {
  s1?: number;
  s2?: number;
} {
  const n = (s: string | undefined) => {
    const x = parseInt(s ?? "", 10);
    return Number.isFinite(x) ? x : undefined;
  };
  return {
    s1: n(process.env.UNEMPLOYABLE_SEASON1_WP_CATEGORY_ID),
    s2: n(process.env.UNEMPLOYABLE_SEASON2_WP_CATEGORY_ID),
  };
}

/** Commons signup — “Join the Co-op” CTAs sitewide. */
export const COMMUNITY_SIGNUP_URL =
  "https://commons.opolis.co/community/signup";

/** Official Privacy Policy PDF (linked from footer and mirrored legal pages). */
export const LEGAL_PRIVACY_POLICY_PDF_URL =
  "https://opolis.co/wp-content/uploads/2026/01/25.12.18_Opolis-Privacy-Policy.docx.pdf";

/** Default OG image and logo URL for schema (absolute). */
export const LOGO_URL =
  process.env.NEXT_PUBLIC_LOGO_URL ??
  `${SITE_URL.replace(/\/$/, "")}/opengraph-image`;

/** Social and profile URLs for Organization sameAs (SEO/GEO). */
export const SAME_AS_URLS: string[] = process.env.NEXT_PUBLIC_SAME_AS
  ? process.env.NEXT_PUBLIC_SAME_AS.split(",").map((s) => s.trim()).filter(Boolean)
  : [];

/** Twitter handle for twitter:site / twitter:creator (e.g. @opolis). */
export const TWITTER_HANDLE =
  process.env.NEXT_PUBLIC_SITE_TWITTER?.trim() || undefined;

export const NAV_PAGES = [
  "Home",
  "The Cooperative",
  "Eligibility",
  "Benefits",
  "Resources",
] as const;

export type NavPage = (typeof NAV_PAGES)[number];

export const ROUTES: Record<string, string> = {
  Home: "/",
  "The Cooperative": "/the-cooperative",
  Eligibility: "/eligibility",
  Benefits: "/benefits",
  Resources: "/resources",
  Join: "/join",
  "About Opolis": "/about",
  "AI Reference": "/ai-reference",
  Contact: "/contact",
};
