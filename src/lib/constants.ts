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

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://opolis.co";

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
