import { SITE_URL } from "@/lib/constants";
import { llmsTxtResponse } from "@/lib/llmsTxt";

export function GET() {
  return llmsTxtResponse(SITE_URL);
}
