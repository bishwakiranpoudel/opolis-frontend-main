import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

const DISALLOW: string[] = ["/api/", "/create"];

/** Crawlers that should receive the same allow/disallow policy as generic *. */
const USER_AGENTS = [
  "*",
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "Googlebot",
  "Anthropic-AI",
  "ClaudeBot",
  "PerplexityBot",
  "Amazonbot",
  "Applebot-Extended",
  "OAI-SearchBot",
  "Bytespider",
  "CCBot",
  "facebookexternalhit",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [...USER_AGENTS].map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: DISALLOW,
    })),
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
