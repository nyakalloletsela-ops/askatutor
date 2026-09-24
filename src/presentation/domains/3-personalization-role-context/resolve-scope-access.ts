import type { FeatureScope } from "@/lib/entitlements.functions";

export function resolveScopeAccess(input: {
  scope: FeatureScope;
  configAvailable: boolean;
  subscriptionsEnabled: boolean;
  isAdmin: boolean;
  isTutor: boolean;
  scopes: readonly FeatureScope[];
  scopesAvailable: boolean;
}): boolean {
  if (!input.configAvailable) return false;
  if (!input.subscriptionsEnabled || input.isAdmin || input.isTutor) return true;
  if (!input.scopesAvailable) return false;
  return input.scopes.includes(input.scope);
}
