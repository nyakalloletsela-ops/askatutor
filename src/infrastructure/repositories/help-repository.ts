import type { HelpMessageInput, HelpRepository } from "@/domain/ports/help-repository";

/**
 * Supabase-backed HelpRepository. The help form is public (unauthenticated),
 * so the write uses the service-role client — there is no RLS row for an
 * anonymous caller to target.
 */
export class SupabaseHelpRepository implements HelpRepository {
  async createMessage(input: HelpMessageInput): Promise<{ id: string }> {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("help_messages")
      .insert({
        name: input.name,
        email: input.email,
        subject: input.subject,
        body: input.body,
        user_id: input.userId ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  }
}