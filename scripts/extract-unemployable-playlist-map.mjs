/**
 * One-off: fetch Unemployable YouTube playlist RSS and write slug → videoId JSON.
 * Playlist: https://www.youtube.com/playlist?list=PLWaBiF0GkcQKHi1lutI8Fu6rW_B3hUrJ4
 *
 * Run: node scripts/extract-unemployable-playlist-map.mjs
 */

import fs from "node:fs";
import path from "node:path";

const PLAYLIST_ID = "PLWaBiF0GkcQKHi1lutI8Fu6rW_B3hUrJ4";
const RSS = `https://www.youtube.com/feeds/videos.xml?playlist_id=${PLAYLIST_ID}`;

const res = await fetch(RSS, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; OpolisPodcastMap/1.0; +https://opolis.co)",
  },
});
if (!res.ok) throw new Error(`RSS ${res.status}`);
const xml = await res.text();

const entries = xml.split("<entry>").slice(1);
const bySlug = {};
const unmatched = [];

for (const block of entries) {
  const vid = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
  const title = block.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  const mediaDesc =
    block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ||
    "";
  const decoded = mediaDesc
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&#39;/g, "'");
  if (!vid) continue;

  const urls = [
    ...decoded.matchAll(
      /https?:\/\/(?:www\.)?opolis\.co\/(?:unemployable\/)?([a-z0-9-]+)\/?/gi
    ),
  ];
  let slug = urls.length ? urls[urls.length - 1][1] : null;

  if (!slug && title) {
    const ep = title.match(/episode\s*(\d+)\s*:/i);
    if (ep) {
      unmatched.push({
        videoId: vid,
        title,
        note: `Episode ${ep[1]} — add opolis slug manually if needed`,
      });
      continue;
    }
  }

  if (slug && slug !== "wp-json" && slug !== "resources") {
    if (bySlug[slug] && bySlug[slug] !== vid) {
      console.warn("duplicate slug", slug, bySlug[slug], vid);
    }
    bySlug[slug] = vid;
  } else {
    unmatched.push({ videoId: vid, title: title || "", slugGuess: slug });
  }
}

const outPath = path.join(
  process.cwd(),
  "data",
  "podcast-unemployable-youtube-by-slug.json"
);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      playlistId: PLAYLIST_ID,
      sourceRss: RSS,
      generatedAt: new Date().toISOString(),
      bySlug,
      unmatched,
    },
    null,
    2
  ),
  "utf8"
);

console.log("Wrote", outPath);
console.log("Mapped slugs:", Object.keys(bySlug).length);
console.log("Unmatched:", unmatched.length);
if (unmatched.length) console.log(JSON.stringify(unmatched, null, 2));
