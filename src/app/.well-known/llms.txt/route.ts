import { SITE_URL } from "@/lib/constants";
import { llmsTxtResponse } from "@/lib/llmsTxt";

/** Mirror for tools that look under /.well-known/ */
export function GET() {
  return llmsTxtResponse(SITE_URL);
}
