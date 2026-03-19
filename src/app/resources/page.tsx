import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { getBlogPosts } from "@/lib/wordpress";
import { getGuides, getFaq } from "@/lib/wordpressResources";
import { ResourcesContent } from "./ResourcesContent";

export const metadata: Metadata = buildMetadata({
  title: "Resources — FAQs, Pricing & Getting Started | Opolis",
  description:
    "FAQs on Opolis membership, payroll, benefits, eligibility, and pricing. Get started with Community ($97) or Employee Membership. Entity setup support available.",
  path: "/resources",
});

export default async function ResourcesPage() {
  const [blogPosts, guides, faqSections] = await Promise.all([
    getBlogPosts(),
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
  ]);
  const webPageLd = webPageJsonLd({
    name: "Resources — FAQs, Pricing & Getting Started | Opolis",
    description:
      "FAQs on Opolis membership, payroll, benefits, eligibility, and pricing. Get started with Community ($97) or Employee Membership. Entity setup support available.",
    url: `${SITE_URL}/resources`,
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
