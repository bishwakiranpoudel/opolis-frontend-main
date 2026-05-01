import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { CoalitionMemberContent } from "@/legal/coalition-member";

export const metadata: Metadata = buildMetadata({
  title: "Coalition Member — Membership Agreement | Opolis",
  description:
    "Coalition Member Membership Agreement for the Employment Commons LCA: covenants, confidentiality, indemnification, and terms of coalition membership.",
  path: "/coalition-member",
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Coalition Member Agreement", path: "/coalition-member" },
]);

const webLd = webPageJsonLd({
  name: "Coalition Member — Membership Agreement | Opolis",
  description:
    "Coalition Member Membership Agreement for the Employment Commons LCA.",
  url: `${SITE_URL.replace(/\/$/, "")}/coalition-member`,
  speakableCssSelectors: [".speakable"],
});

export default function CoalitionMemberPage() {
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
        <CoalitionMemberContent />
      </section>
    </>
  );
}
