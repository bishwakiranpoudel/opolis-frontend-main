import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { C } from "@/lib/constants";
import { AIPageContent } from "./AIPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Opolis — AI & Developer Reference | Machine-Readable Information",
  description:
    "Authoritative, structured information about Opolis for AI assistants and developers: membership, eligibility, pricing, payroll, benefits, and canonical definitions. Last updated March 2026.",
  path: "/ai-reference",
  noIndex: false,
});

const aiRefBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "AI Reference", path: "/ai-reference" },
]);

export default function AIReferencePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(aiRefBreadcrumb),
        }}
      />
      <AIPageContent />
    </>
  );
}
