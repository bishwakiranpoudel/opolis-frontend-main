import type { Metadata } from "next";
import { buildMetadata, breadcrumbJsonLd, webPageJsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/constants";
import {
  getResolvedStateFloors,
  getUsStatesSorted,
} from "@/lib/firebase/site-content-read";
import { EligibilityContent } from "./EligibilityContent";

export const revalidate = 0;

export const metadata: Metadata = buildMetadata({
  title: "Eligibility — Is Opolis Right for You? | State Salary Minimums",
  description:
    "Employee Membership requires an S-Corp or C-Corp and income meeting your state's exempt salary minimum. Community Membership is open to everyone — $97 one-time.",
  path: "/eligibility",
});

const eligibilityBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Eligibility", path: "/eligibility" },
]);
const eligibilityWebPageLd = webPageJsonLd({
  name: "Eligibility — Is Opolis Right for You? | State Salary Minimums",
  description:
    "Employee Membership requires an S-Corp or C-Corp and income meeting your state's exempt salary minimum. Community Membership is open to everyone — $97 one-time.",
  url: `${SITE_URL}/eligibility`,
  speakableCssSelectors: [".speakable"],
});

export default async function EligibilityPage() {
  const stateFloors = await getResolvedStateFloors();
  const usStates = getUsStatesSorted(stateFloors);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eligibilityBreadcrumb),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eligibilityWebPageLd),
        }}
      />
      <EligibilityContent stateFloors={stateFloors} usStates={usStates} />
    </>
  );
}
