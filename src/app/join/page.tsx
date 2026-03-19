import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JoinContent } from "./JoinContent";

export const metadata: Metadata = buildMetadata({
  title: "Join Opolis — Get Started with the Employment Cooperative",
  description:
    "Join the Opolis cooperative. Application takes minutes. New Members activate on the 1st of each month. Community ($97) or Employee Membership.",
  path: "/join",
});

const joinBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Join", path: "/join" },
]);

export default function JoinPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(joinBreadcrumb),
        }}
      />
      <JoinContent />
    </>
  );
}
