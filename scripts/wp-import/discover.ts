/**
 * WordPress discovery: post counts, media, REST types, custom opolis routes.
 * Writes logs/discovery-report.json (see .gitignore).
 */

import fs from "node:fs";
import path from "node:path";
import "./config";
import {
  countMediaItems,
  fetchAllPostsFull,
  fetchWpTypes,
  tryFetchCustomFaq,
  tryFetchCustomGuides,
} from "./wp-client";
import { requireWordPressUrl } from "./config";
import { FAQ_SECTIONS, GUIDES_DATA } from "../../src/lib/resourcesData";

async function main() {
  requireWordPressUrl();
  const posts = await fetchAllPostsFull();
  const mediaCount = await countMediaItems();
  const types = await fetchWpTypes();
  const guidesApi = await tryFetchCustomGuides();
  const faqApi = await tryFetchCustomFaq();

  const report = {
    generatedAt: new Date().toISOString(),
    wordPressUrl: process.env.WORDPRESS_URL,
    posts: {
      count: posts.length,
      slugs: posts.map((p) => p.slug),
    },
    mediaLibraryTotal: mediaCount,
    restTypes: Object.keys(types),
    customEndpoints: {
      opolisGuides: guidesApi != null ? "ok" : "missing_or_error",
      opolisFaq: faqApi != null ? "ok" : "missing_or_error",
    },
    staticFallbackInRepo: {
      guidesSections: GUIDES_DATA.length,
      guideItemUrls: GUIDES_DATA.flatMap((g) => g.items.map((i) => i.url)),
      faqSections: FAQ_SECTIONS.length,
    },
    samples: {
      guidesApi: guidesApi,
      faqApi: faqApi,
    },
  };

  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const outPath = path.join(logDir, "discovery-report.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Posts: ${posts.length}, Media (library): ${mediaCount}, REST types: ${report.restTypes.length}`);
  console.log(`Custom opolis/v1 guides: ${report.customEndpoints.opolisGuides}`);
  console.log(`Custom opolis/v1 faq: ${report.customEndpoints.opolisFaq}`);
  console.log(`Static GUIDES_DATA sections: ${GUIDES_DATA.length}, FAQ sections: ${FAQ_SECTIONS.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
