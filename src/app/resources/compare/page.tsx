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
  title: "Resources — Comparisons | Opolis",
  description:
    "Compare Opolis to typical payroll, DIY S-Corp, and 1099 arrangements across employment, benefits, and compliance.",
  path: "/resources/compare",
});

export default async function ResourcesComparePage() {
  const [blogPosts, guides, faqSections] = await Promise.all([
    getBlogPosts(),
    getGuides(),
    getFaq(),
  ]);

  const faqForLd = faqSections.flatMap((s) =>
    s.items.map((item) => ({ question: item.q, answer: item.a }))
  );
  const faqLd = faqJsonLd(faqForLd, `${SITE_URL}/resources/compare`);

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Resources", path: "/resources" },
    { name: "Comparisons", path: "/resources/compare" },
  ]);
  const webPageLd = webPageJsonLd({
    name: "Resources — Comparisons | Opolis",
    description:
      "Compare Opolis to typical payroll, DIY S-Corp, and 1099 arrangements.",
    url: `${SITE_URL}/resources/compare`,
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
