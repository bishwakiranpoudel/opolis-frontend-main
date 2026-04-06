import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

type UrlMapping = { from: string; to: string; permanent?: boolean };

function loadRedirectsFromMap(): {
  source: string;
  destination: string;
  permanent: boolean;
}[] {
  const filePath = path.join(process.cwd(), "data", "url-redirect-map.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as { mappings?: UrlMapping[] };
    const mappings = parsed.mappings;
    if (!Array.isArray(mappings)) return [];
    const out: { source: string; destination: string; permanent: boolean }[] = [];
    for (const m of mappings) {
      if (!m?.from || !m?.to) continue;
      if (m.from.startsWith("/")) {
        out.push({
          source: m.from,
          destination: m.to,
          permanent: m.permanent !== false,
        });
        continue;
      }
      try {
        const u = new URL(m.from);
        out.push({
          source: `${u.pathname}${u.search || ""}`,
          destination: m.to,
          permanent: m.permanent !== false,
        });
      } catch {
        /* skip invalid */
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** Entries in data/url-map-unresolved.json with both oldPath and newPath set (SEO / legacy URLs). */
function loadRedirectsFromUnresolved(): {
  source: string;
  destination: string;
  permanent: boolean;
}[] {
  const filePath = path.join(process.cwd(), "data", "url-map-unresolved.json");
  if (!fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as {
      mappings?: { oldPath?: string; newPath?: string }[];
    };
    const mappings = parsed.mappings;
    if (!Array.isArray(mappings)) return [];
    const out: { source: string; destination: string; permanent: boolean }[] =
      [];
    for (const m of mappings) {
      const from = m?.oldPath?.trim();
      const to = m?.newPath?.trim();
      if (!from || !to) continue;
      if (!from.startsWith("/")) continue;
      if (!to.startsWith("/") && !/^https?:\/\//i.test(to)) continue;
      out.push({
        source: from,
        destination: to,
        permanent: true,
      });
    }
    return out;
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/resources/blog", permanent: true },
      ...loadRedirectsFromMap(),
      ...loadRedirectsFromUnresolved(),
    ];
  },
};

export default nextConfig;
