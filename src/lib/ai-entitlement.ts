import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AiScope = "ai" | "labs";
export type UserRole = "admin" | "tutor" | "student" | "parent";

export interface PlatformConfigShape {
  is_subscriptions_enabled: boolean;
  ai_enabled: boolean;
  whiteboard_ocr_enabled?: boolean;
}

/**
 * Minimal, dependency-free contract so the entitlement logic can be unit-tested
 * with a fake gateway and bound to the real Supabase client at runtime.
 */
export interface EntitlementGateway {
  getRoles(
    userId: string,
  ): Promise<{ data: UserRole[] | null; error: { message: string } | null }>;
  getConfig(): Promise<{
    data: PlatformConfigShape | null;
    error: { message: string } | null;
  }>;
  getScopes(userId: string): Promise<{ data: string[] | null; error: { message: string } | null }>;
  hasApprovedLegacySubscription(
    userId: string,
  ): Promise<{ data: boolean; error: { message: string } | null }>;
}

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

/** Binds the gateway contract to a user-scoped Supabase client. */
export function supabaseEntitlementGateway(
  supabase: SupabaseClient<Database>,
): EntitlementGateway {
  return {
    async getRoles(userId) {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      return { data: (data ?? []) as unknown as UserRole[], error };
    },
    async getConfig() {
      const { data, error } = await supabase
        .from("platform_config")
        .select("is_subscriptions_enabled, ai_enabled, whiteboard_ocr_enabled")
        .eq("id", 1)
        .maybeSingle();
      return { data: (data ?? null) as PlatformConfigShape | null, error };
    },
    async getScopes() {
      // get_my_scopes resolves auth.uid() from the caller's JWT server-side.
      const { data, error } = await supabase.rpc("get_my_scopes");
      return { data: (data ?? []) as string[] | null, error };
    },
    async hasApprovedLegacySubscription(userId) {
      const { data, error } = await supabase
        .from("student_subscriptions")
        .select("id")
        .eq("student_id", userId)
        .eq("status", "approved")
        .limit(1)
        .maybeSingle();
      return { data: !!data, error };
    },
  };
}
