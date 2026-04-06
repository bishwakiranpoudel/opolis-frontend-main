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
  title: "Blog — Articles & updates | Opolis Resources",
  description:
    "Articles on employment infrastructure, payroll, benefits, taxes, and independent work from Opolis.",
  path: "/resources/blog",
});

export default async function ResourcesBlogPage() {
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
    { name: "Blog", path: "/resources/blog" },
  ]);
  const webPageLd = webPageJsonLd({
    name: "Blog — Articles & updates | Opolis Resources",
    description:
      "Articles on employment infrastructure, payroll, benefits, taxes, and independent work from Opolis.",
    url: `${SITE_URL}/resources/blog`,
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
        initialTab="blog"
      />
    </>
  );
}
