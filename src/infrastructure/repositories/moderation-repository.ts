import type { UserDataClient } from "./helpers";
import type { ForumPostInput, ModerationRepository } from "@/domain/ports/moderation-repository";

/**
 * Supabase-backed ModerationRepository — forum post creation via the RLS
 * caller client.
 */
export class SupabaseModerationRepository implements ModerationRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async createPost(input: ForumPostInput): Promise<void> {
    const { error } = await this.supabase.from("forum_posts").insert({
      user_id: input.userId,
      title: input.title,
      body: input.body,
      subject: input.subject,
      parent_id: input.parentId,
    });
    if (error) throw new Error(error.message);
  }
}