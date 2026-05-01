import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
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

const cooperativeWebPageLd = webPageJsonLd({
  name: "The Cooperative — How Opolis Works | Member-Owned Employment",
  description:
    "Two membership tiers: Community ($97 one-time) and Employee (full W-2 payroll, benefits, compliance). Start in minutes — upgrade when you're ready for the full employment stack.",
  url: `${SITE_URL}/the-cooperative`,
  speakableCssSelectors: [".speakable"],
});

export default function TheCooperativePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cooperativeBreadcrumb),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cooperativeWebPageLd),
        }}
      />
      <TheCooperativeContent />
    </>
  );
}
