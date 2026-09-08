import type { UserDataClient } from "./helpers";
import type { DirectMessageInput, MessageRepository } from "@/domain/ports/message-repository";

/**
 * Supabase-backed MessageRepository — inserts into `messages` with the RLS
 * caller client.
 */
export class SupabaseMessageRepository implements MessageRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async send(message: DirectMessageInput): Promise<void> {
    const { error } = await this.supabase.from("messages").insert({
      sender_id: message.senderId,
      recipient_id: message.recipientId,
      body: message.body,
    });
    if (error) throw new Error(error.message);
  }
}