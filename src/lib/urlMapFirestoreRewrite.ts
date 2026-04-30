/**
 * Rewrite internal opolis.co links in stored HTML / URLs using a pathname → pathname map
 * (from `url_map_pending` + optional `data/url-map-unresolved.json`).
 */

import * as cheerio from "cheerio";
import { isOpolisSiteHostname, normalizeSitePathname } from "@/lib/site-paths";

export type PendingUrlMapRow = {
  oldUrl?: string;
  suggestedNewPath?: string | null;
};

/** Build map: normalized legacy pathname → normalized target pathname (drops identity rows). */
export function pathnameTargetMapFromPendingRows(
  rows: PendingUrlMapRow[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const d of rows) {
    const sug = d.suggestedNewPath?.trim();
    if (!sug || !d.oldUrl) continue;
    try {
      const u = new URL(d.oldUrl);
      if (!isOpolisSiteHostname(u.hostname)) continue;
      const key = normalizeSitePathname(u.pathname);
      const target = normalizeSitePathname(sug);
      if (!target || key === target) continue;
      if (!map.has(key)) map.set(key, target);
    } catch {
      /* skip */
    }
  }
  return map;
}

export function mergeUnresolvedJsonIntoPathMap(
  map: Map<string, string>,
  mappings: { oldPath?: string; newPath?: string }[]
): void {
  for (const m of mappings) {
    const oldP = m.oldPath?.trim();
    const newP = m.newPath?.trim();
    if (!oldP || !newP) continue;
    const key = normalizeSitePathname(oldP);
    const target = normalizeSitePathname(newP);
    if (!target || key === target) continue;
    if (!map.has(key)) map.set(key, target);
  }
}

function replacementForParsedUrl(
  u: URL,
  pathMap: Map<string, string>,
  originNoSlash: string
): string | null {
  if (!isOpolisSiteHostname(u.hostname)) return null;
  const key = normalizeSitePathname(u.pathname);
  const target = pathMap.get(key);
  if (!target) return null;
  const tnorm = normalizeSitePathname(target);
  if (tnorm === key) return null;
  return `${originNoSlash}${tnorm}${u.search}${u.hash}`;
}

/**
 * Rewrite href/src/action/srcset on opolis hosts. Also replaces common full-URL strings
 * (avoids missing links outside well-formed attributes).
 */
export function rewriteHtmlOpolisUrlMap(
  html: string,
  pathMap: Map<string, string>,
  siteOrigin: string
): string {
  if (!html?.trim() || pathMap.size === 0) return html;
  const originNoSlash = siteOrigin.replace(/\/$/, "");

  const WRAP = "__opolis_url_map_fragment";
  const $ = cheerio.load(`<div id="${WRAP}">${html}</div>`, {
    decodeEntities: false,
  });

  const rewriteAttr = (selector: string, attr: string) => {
    $(selector).each((_, el) => {
      const raw = $(el).attr(attr);
      if (!raw?.trim()) return;
      try {
        const u = new URL(raw.trim(), `${originNoSlash}/`);
        const next = replacementForParsedUrl(u, pathMap, originNoSlash);
        if (next) $(el).attr(attr, next);
      } catch {
        /* keep */
      }
    });
  };

  rewriteAttr("a[href]", "href");
  rewriteAttr("area[href]", "href");
  rewriteAttr("iframe[src]", "src");
  rewriteAttr("img[src]", "src");
  rewriteAttr("img[data-src]", "data-src");
  rewriteAttr("video[src]", "src");
  rewriteAttr("audio[src]", "src");
  rewriteAttr("source[src]", "src");
  rewriteAttr("form[action]", "action");

  $("img[srcset], source[srcset]").each((_, el) => {
    const raw = $(el).attr("srcset");
    if (!raw) return;
    const rebuilt = raw.split(",").map((chunk) => {
      const trimmed = chunk.trim();
      const urlPart = trimmed.split(/\s+/)[0];
      if (!urlPart) return trimmed;
      try {
        const u = new URL(urlPart, `${originNoSlash}/`);
        const next = replacementForParsedUrl(u, pathMap, originNoSlash);
        return next ? trimmed.replace(urlPart, next) : trimmed;
      } catch {
        return trimmed;
      }
    });
    $(el).attr("srcset", rebuilt.join(", "));
  });

  let out = $(`#${WRAP}`).html();
  if (out == null || out === "") out = html;

  const keys = [...pathMap.keys()].sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (key === "/" || key === "") continue;
    const target = pathMap.get(key)!;
    const encodedOriginPairs: [string, string][] = [
      [`https://opolis.co${key}`, `${originNoSlash}${target}`],
      [`https://www.opolis.co${key}`, `${originNoSlash}${target}`],
      [`http://opolis.co${key}`, `${originNoSlash}${target}`],
      [`http://www.opolis.co${key}`, `${originNoSlash}${target}`],
    ];
    if (!key.endsWith("/")) {
      encodedOriginPairs.push(
        [`https://opolis.co${key}/`, `${originNoSlash}${target}`],
        [`https://www.opolis.co${key}/`, `${originNoSlash}${target}`]
      );
    }
    for (const [from, to] of encodedOriginPairs) {
      out = out.split(from).join(to);
      out = out.split(from.replace(/&/g, "&amp;")).join(
        to.replace(/&/g, "&amp;")
      );
    }
  }

  return out;
}

/** Guides / FAQ item URLs and relative paths starting with `/`. */
export function rewriteBareOpolisTarget(
  raw: string,
  pathMap: Map<string, string>,
  siteOrigin: string
): string {
  const t = raw.trim();
  if (!t || pathMap.size === 0) return raw;
  const originNoSlash = siteOrigin.replace(/\/$/, "");

  if (t.startsWith("/") && !t.startsWith("//")) {
    const q = t.indexOf("?");
    const h = t.indexOf("#");
    let pathEnd = t.length;
    if (q >= 0) pathEnd = Math.min(pathEnd, q);
    if (h >= 0) pathEnd = Math.min(pathEnd, h);
    const pathOnly = t.slice(0, pathEnd);
    const tail = t.slice(pathEnd);
    const key = normalizeSitePathname(pathOnly);
    const target = pathMap.get(key);
    if (!target) return raw;
    return `${normalizeSitePathname(target)}${tail}`;
  }

  try {
    const u = new URL(t);
    if (!isOpolisSiteHostname(u.hostname)) return raw;
    const next = replacementForParsedUrl(u, pathMap, originNoSlash);
    return next ?? raw;
  } catch {
    return raw;
  }
}

export function rewriteLegacyPermalinkField(
  raw: string,
  pathMap: Map<string, string>,
  siteOrigin: string
): string {
  const t = raw.trim();
  if (!t) return raw;
  try {
    const u = new URL(t);
    if (!isOpolisSiteHostname(u.hostname)) return raw;
    const originNoSlash = siteOrigin.replace(/\/$/, "");
    const next = replacementForParsedUrl(u, pathMap, originNoSlash);
    return next ?? raw;
  } catch {
    return raw;
  }
}

function coerceFirestoreArray(value: unknown): unknown[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    const keys = Object.keys(o).filter((k) => /^\d+$/.test(k));
    if (keys.length === 0) return [];
    return keys
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => o[k]);
  }
  return [];
}

/** Deep-clone Firestore `resources_guides/data`-shaped payload and rewrite item `url` fields. */
export function rewriteResourcesGuidesPayload(
  data: Record<string, unknown>,
  pathMap: Map<string, string>,
  siteOrigin: string
): Record<string, unknown> {
  const clone = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  const guides = coerceFirestoreArray(clone.guides);
  for (const sec of guides) {
    if (!sec || typeof sec !== "object") continue;
    const o = sec as Record<string, unknown>;
    const items = coerceFirestoreArray(o.items);
    for (const it of items) {
      if (!it || typeof it !== "object") continue;
      const row = it as Record<string, unknown>;
      if (typeof row.url === "string") {
        row.url = rewriteBareOpolisTarget(row.url, pathMap, siteOrigin);
      }
    }
    o.items = items;
  }
  clone.guides = guides;
  return clone;
}

/** Deep-clone FAQ payload and rewrite inline HTML in questions/answers. */
export function rewriteResourcesFaqPayload(
  data: Record<string, unknown>,
  pathMap: Map<string, string>,
  siteOrigin: string
): Record<string, unknown> {
  const rewrite = (html: string) =>
    rewriteHtmlOpolisUrlMap(html, pathMap, siteOrigin);
  const clone = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  const faq = coerceFirestoreArray(clone.faq);
  for (const sec of faq) {
    if (!sec || typeof sec !== "object") continue;
    const o = sec as Record<string, unknown>;
    const items = coerceFirestoreArray(o.items);
    for (const it of items) {
      if (!it || typeof it !== "object") continue;
      const row = it as Record<string, unknown>;
      if (typeof row.q === "string") row.q = rewrite(row.q);
      if (typeof row.a === "string") row.a = rewrite(row.a);
    }
    o.items = items;
  }
  clone.faq = faq;
  return clone;
}
