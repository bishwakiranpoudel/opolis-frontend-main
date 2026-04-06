/**
 * Scan blog_posts in Firestore for opolis.co links; write logs for manual SEO mapping.
 * Also merges with data/url-redirect-map.json "discovered" section (report only).
 *
 * Usage: npx tsx scripts/wp-import/extract-links.ts
 */

import "./config";
import fs from "node:fs";
import path from "node:path";
import { getFirestore } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../src/lib/firebase/admin";
import { COLLECTIONS } from "../../src/lib/firebase/schema";
import type { BlogPostDoc } from "../../src/lib/firebase/types";
import { extractOpolisLinks } from "./lib/html-assets";
import { requireWordPressUrl } from "./config";

async function main() {
  requireWordPressUrl();
  getFirebaseAdmin();
  const db = getFirestore();

  const base = requireWordPressUrl();
  const posts = await db.collection(COLLECTIONS.blogPosts).get();

  const byUrl = new Map<string, { slugs: Set<string> }>();

  for (const doc of posts.docs) {
    const p = doc.data() as BlogPostDoc;
    const html = `${p.contentHtml || ""} ${p.excerptHtml || ""}`;
    const links = extractOpolisLinks(html, base);
    for (const u of links) {
      let e = byUrl.get(u);
      if (!e) {
        e = { slugs: new Set() };
        byUrl.set(u, e);
      }
      e.slugs.add(doc.id);
    }
  }

  const discovered = [...byUrl.entries()].map(([url, v]) => ({
    url,
    foundInSlugs: [...v.slugs],
    suggestedNewPath: null as string | null,
  }));

  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const out = path.join(logDir, "extracted-opolis-links.json");
  fs.writeFileSync(
    out,
    JSON.stringify({ generatedAt: new Date().toISOString(), discovered }, null, 2),
    "utf8"
  );

  console.log(`Found ${discovered.length} unique opolis.co links. Wrote ${out}`);
  console.log(
    "Add manual mappings in data/url-redirect-map.json and optionally next.config redirects."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
