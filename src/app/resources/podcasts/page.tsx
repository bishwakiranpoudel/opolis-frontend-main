import type { Metadata } from "next";
import {
  buildMetadata,
  breadcrumbJsonLd,
  faqJsonLd,
  webPageJsonLd,
} from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { getBlogPosts } from "@/lib/wordpress";
import { getGuides, getFaq } from "@/lib/wordpressResources";
import { getPodcastEpisodes } from "@/lib/podcasts";
import { ResourcesContent } from "../ResourcesContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Podcast — UNEMPLOYABLE & Opolis Public Radio | Opolis Resources",
  description:
    "Episodes on independent work, payroll, benefits, and the future of work — UNEMPLOYABLE and Opolis Public Radio.",
  path: "/resources/podcasts",
});

export default async function ResourcesPodcastsPage() {
  const [blogPosts, podcasts, guides, faqSections] = await Promise.all([
    getBlogPosts(),
    getPodcastEpisodes(),
    getGuides(),
    getFaq(),
  ]);

  const faqForLd = faqSections.flatMap((s) =>
    s.items.map((item) => ({ question: item.q, answer: item.a }))
  );
  const faqLd = faqJsonLd(faqForLd);

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Podcast", path: "/resources/podcasts" },
  ]);
  const webPageLd = webPageJsonLd({
    name: "Podcast — UNEMPLOYABLE & Opolis Public Radio | Opolis Resources",
    description:
      "Episodes on independent work, payroll, benefits, and the future of work.",
    url: `${SITE_URL}/resources/podcasts`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <ResourcesContent
        initialPosts={blogPosts}
        initialPodcasts={podcasts}
        initialGuides={guides}
        initialFaq={faqSections}
      />
    </>
  );
}
