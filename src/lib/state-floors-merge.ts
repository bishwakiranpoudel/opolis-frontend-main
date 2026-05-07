import { STATE_FLOORS } from "@/lib/constants";

/** Upper bound for a yearly salary floor (cents not used — whole dollars). */
export const STATE_FLOOR_MAX = 99_999_999;

/**
 * Merge Firestore (or API) floor values onto code defaults.
 * Unknown keys, NaN, negative, or out-of-range values are ignored per key.
 */
export function mergeStateFloorsFromStored(
  stored: unknown
): Record<string, number> {
  const out: Record<string, number> = { ...STATE_FLOORS };
  if (!stored || typeof stored !== "object") return out;
  const src = stored as Record<string, unknown>;
  for (const k of Object.keys(STATE_FLOORS)) {
    const v = src[k];
    if (
      typeof v === "number" &&
      Number.isFinite(v) &&
      v >= 0 &&
      v <= STATE_FLOOR_MAX
    ) {
      out[k] = Math.round(v);
    }
  }
  return out;
}
