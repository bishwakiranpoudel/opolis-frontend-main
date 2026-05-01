import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { TermsOfServiceContent } from "@/legal/terms-of-service-content";

export const metadata: Metadata = buildMetadata({
  title: "Terms of Service — Employment Commons LCA | Opolis",
  description:
    "Terms of Service for the Employment Commons LCA platform: accounts, EOR services, fees, arbitration, and member responsibilities. Last updated October 1, 2024.",
  path: "/terms-of-service",
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Terms of Service", path: "/terms-of-service" },
]);

const webLd = webPageJsonLd({
  name: "Terms of Service — Employment Commons LCA | Opolis",
  description:
    "Terms of Service for the Employment Commons LCA and Opolis platform.",
  url: `${SITE_URL.replace(/\/$/, "")}/terms-of-service`,
  speakableCssSelectors: [".speakable"],
});

export default function TermsOfServicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webLd) }}
      />
      <section className="sec-alt legal-page-section">
        <TermsOfServiceContent />
      </section>
    </>
  );
}
