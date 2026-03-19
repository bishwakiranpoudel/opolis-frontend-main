import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import { BylawsContent } from "@/legal/bylaws";

export const metadata: Metadata = buildMetadata({
  title: "Bylaws — Employment Commons LCA | Opolis",
  description:
    "Employment Commons LCA Bylaws: membership, Employee and Coalition Members, Board of Stewards, meetings, capital, patronage, and cooperative governance.",
  path: "/bylaws",
});

const breadcrumbLd = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Bylaws", path: "/bylaws" },
]);

const webLd = webPageJsonLd({
  name: "Bylaws — Employment Commons LCA | Opolis",
  description:
    "Employment Commons LCA Bylaws: membership, governance, capital, and member rights.",
  url: `${SITE_URL.replace(/\/$/, "")}/bylaws`,
});

export default function BylawsPage() {
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
        <BylawsContent />
      </section>
    </>
  );
}
