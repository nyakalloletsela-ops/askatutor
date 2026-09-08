import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  EntitlementGateway,
  UserRole,
  PlatformConfigShape,
} from "@/application/contracts/entitlements";

/**
 * Supabase Entitlement Gateway
 *
 * Infrastructure adapter that implements the EntitlementGateway contract
 * using Supabase as the data source.
 *
 * Extracted from src/lib/ai-entitlement.ts to establish a proper boundary
 * between Application contracts and Infrastructure implementations.
 */
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
