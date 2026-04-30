import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { TheCooperativeContent } from "./TheCooperativeContent";

export const metadata: Metadata = buildMetadata({
  title: "The Cooperative — How Opolis Works | Member-Owned Employment",
  description:
    "Two membership tiers: Community ($97 one-time) and Employee (full W-2 payroll, benefits, compliance). Start in minutes — upgrade when you're ready for the full employment stack.",
  path: "/the-cooperative",
});

const cooperativeBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "The Cooperative", path: "/the-cooperative" },
]);

export default function TheCooperativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cooperativeBreadcrumb),
        }}
      />
      <TheCooperativeContent />
    </>
  );
}
