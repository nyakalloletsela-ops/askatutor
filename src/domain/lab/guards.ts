/**
 * Shared type guards for the Virtual Lab contract layer.
 *
 * Pure, side-effect free, deterministic. Extracted from validation.ts so
 * expression.ts, knowledge.ts, and other modules can reuse them without
 * importing the full validation module.
 */

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
