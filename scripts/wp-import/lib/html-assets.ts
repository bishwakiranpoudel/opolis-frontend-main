import * as cheerio from "cheerio";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|avif|bmp)(\?|$)/i;

function isProbablyAssetUrl(href: string): boolean {
  if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (IMAGE_EXT.test(href)) return true;
  if (href.includes("/wp-content/uploads/")) return true;
  if (href.includes("/wp-content/")) return true;
  return false;
}

export function normalizeUrl(raw: string, baseOrigin: string): string | null {
  try {
    const u = new URL(raw, baseOrigin.endsWith("/") ? baseOrigin : `${baseOrigin}/`);
    return u.href;
  } catch {
    return null;
  }
}

/**
 * Collect asset URLs from post HTML for mirroring to Storage.
 */
export function collectAssetUrls(html: string, baseOrigin: string): Set<string> {
  const urls = new Set<string>();
  if (!html?.trim()) return urls;

  const $ = cheerio.load(html, { decodeEntities: false });

  $("img[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src) {
      const n = normalizeUrl(src, baseOrigin);
      if (n) urls.add(n);
    }
  });

  $("img[data-src]").each((_, el) => {
    const src = $(el).attr("data-src");
    if (src) {
      const n = normalizeUrl(src, baseOrigin);
      if (n) urls.add(n);
    }
  });

  $("source[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (!srcset) return;
    for (const part of srcset.split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) {
        const n = normalizeUrl(url, baseOrigin);
        if (n) urls.add(n);
      }
    }
  });

  $("img[srcset]").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (!srcset) return;
    for (const part of srcset.split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url) {
        const n = normalizeUrl(url, baseOrigin);
        if (n) urls.add(n);
      }
    }
  });

  $('a[href]').each((_, el) => {
    const href = $(el).attr("href");
    if (href && isProbablyAssetUrl(href)) {
      const n = normalizeUrl(href, baseOrigin);
      if (n) urls.add(n);
    }
  });

  return urls;
}

/**
 * Replace old URLs in HTML with new public URLs (exact string replace per mapping).
 */
export function rewriteHtmlUrls(html: string, mapping: Map<string, string>): string {
  if (!html || mapping.size === 0) return html;
  let out = html;
  for (const [from, to] of mapping) {
    if (from !== to) {
      out = out.split(from).join(to);
    }
  }
  return out;
}

export function extractOpolisLinks(html: string, baseOrigin: string): string[] {
  const found = new Set<string>();
  if (!html?.trim()) return [];
  const $ = cheerio.load(html, { decodeEntities: false });
  $('a[href]').each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const n = normalizeUrl(href, baseOrigin);
    if (!n) return;
    try {
      const u = new URL(n);
      if (u.hostname.includes("opolis.co")) found.add(n);
    } catch {
      /* ignore */
    }
  });
  return [...found];
}
