import type {
  EmailSuppressionRepository,
  UnsubscribeResult,
  UnsubscribeTokenStatus,
} from "@/domain/ports/email-suppression-repository";

/**
 * Supabase-backed EmailSuppressionRepository for one-click unsubscribe.
 * Uses the service-role client because these endpoints are unauthenticated
 * (RFC 8058 token endpoint) and there is no signed-in caller to scope to.
 */
export class SupabaseEmailSuppressionRepository implements EmailSuppressionRepository {
  async checkUnsubscribeToken(token: string): Promise<UnsubscribeTokenStatus> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tokenRecord, error } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error || !tokenRecord) return { valid: false, reason: "invalid" };
    if (tokenRecord.used_at) return { valid: false, reason: "already_unsubscribed" };
    return { valid: true };
  }

  async consumeUnsubscribeToken(token: string): Promise<UnsubscribeResult> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tokenRecord, error: lookupError } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("*")
      .eq("token", token)
      .maybeSingle();
    if (lookupError || !tokenRecord) return { success: false, reason: "not_found" };
    if (tokenRecord.used_at) return { success: false, reason: "already_unsubscribed" };

    // Atomic check-and-update to avoid the TOCTOU race.
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token)
      .is("used_at", null)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Failed to mark token as used", { error: updateError, token });
      return { success: false, reason: "failed" };
    }
    if (!updated) return { success: false, reason: "already_unsubscribed" };

    // Upsert into the suppressed list (duplicate-safe via email conflict).
    const { error: suppressError } = await supabaseAdmin
      .from("suppressed_emails")
      .upsert(
        { email: tokenRecord.email.toLowerCase(), reason: "unsubscribe" },
        { onConflict: "email" },
      );
    if (suppressError) {
      console.error("Failed to suppress email", {
        error: suppressError,
        email: tokenRecord.email.replace(/^([^@]{1})[^@]*@/, "$1***@"),
      });
      return { success: false, reason: "failed" };
    }

    return { success: true };
  }
}