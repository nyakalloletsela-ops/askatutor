/**
 * Re-exports from the Application Layer.
 *
 * This file preserves backward compatibility for existing consumers
 * that import from @/lib/entitlements.functions.
 *
 * All application logic now lives in:
 *   src/application/use-cases/identity/check-access.ts
 */
export type { FeatureScope } from "@/application/contracts/entitlements";
export { getMyScopes } from "@/application/use-cases/identity/check-access";
