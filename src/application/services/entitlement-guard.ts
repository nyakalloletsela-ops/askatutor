import type { EntitlementGateway, AiScope } from "@/application/contracts/entitlements";

/**
 * premiumMessage — user-facing copy for a denied premium capability.
 */
export function premiumMessage(scope: AiScope): string {
  return scope === "labs"
    ? "Labs is a premium feature. Submit your monthly subscription on the dashboard to unlock it."
    : "AI Coach is a premium feature. Submit your monthly subscription on the dashboard to unlock it.";
}

/**
 * Single shared server-side gate for every billable AI capability.
 *
 * Rules:
 *  - AI disabled platform-wide        -> deny (fail closed).
 *  - admin or tutor                   -> allow (no subscription needed).
 *  - subscriptions disabled platform   -> allow (open mode).
 *  - otherwise require the matching feature scope, with a legacy
 *    approved `student_subscriptions` row still counting for the 'ai' scope
 *    so existing subscribers are not locked out.
 *
 * Failures to read config/roles/scopes always deny rather than fail open.
 *
 * The gateway (port implementation) is supplied by the Infrastructure
 * composition root via context; this function is pure Application logic.
 */
export async function assertAiEntitlement(
  gateway: EntitlementGateway,
  userId: string,
  scope: AiScope,
  opts?: { requireOcrEnabled?: boolean },
): Promise<void> {
  const cfg = await gateway.getConfig();
  if (cfg.error || !cfg.data) {
    throw new Error("Unable to verify feature access. Please try again.");
  }
  const config = cfg.data;

  if (config.ai_enabled === false) {
    throw new Error("AI features are currently disabled by the platform admin.");
  }
  if (opts?.requireOcrEnabled && config.whiteboard_ocr_enabled === false) {
    throw new Error("Whiteboard OCR is disabled by the platform admin.");
  }

  const rolesRes = await gateway.getRoles(userId);
  if (rolesRes.error) throw new Error(rolesRes.error.message);
  const roleSet = new Set(rolesRes.data ?? []);
  if (roleSet.has("admin") || roleSet.has("tutor")) return;

  if (config.is_subscriptions_enabled === false) return;

  const scopes = await gateway.getScopes(userId);
  if (scopes.error) throw new Error(scopes.error.message);
  if ((scopes.data ?? []).includes(scope)) return;

  if (scope === "ai") {
    const legacy = await gateway.hasApprovedLegacySubscription(userId);
    if (legacy.error) throw new Error(legacy.error.message);
    if (legacy.data) return;
  }

  throw new Error(premiumMessage(scope));
}