import { permanentRedirect } from "next/navigation";

/**
 * /resources/blog/{category} (no slug) → 301 to the single blog listing.
 * Keeps a single canonical listing URL per decision in the plan.
 */
export default function ResourcesBlogCategoryRedirect() {
  permanentRedirect("/resources/blog");
}
