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
import { ResourcesContent } from "../ResourcesContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Resources — Guides | Opolis",
  description:
    "Guides, graphics, and downloads on entity setup, payroll, benefits, taxes, and the cooperative.",
  path: "/resources/guides",
});

export default async function ResourcesGuidesPage() {
  const [blogPosts, guides, faqSections] = await Promise.all([
    getBlogPosts(),
    getGuides(),
    getFaq(),
  ]);

  const faqForLd = faqSections.flatMap((s) =>
    s.items.map((item) => ({ question: item.q, answer: item.a }))
  );
  const faqLd = faqJsonLd(faqForLd, `${SITE_URL}/resources/guides`);

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Guides", path: "/resources/guides" },
  ]);
  const webPageLd = webPageJsonLd({
    name: "Resources — Guides | Opolis",
    description:
      "Guides, graphics, and downloads on entity setup, payroll, benefits, taxes, and the cooperative.",
    url: `${SITE_URL}/resources/guides`,
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
        initialGuides={guides}
        initialFaq={faqSections}
      />
    </>
  );
}
