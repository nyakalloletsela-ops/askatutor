import type { UserDataClient } from "./helpers";
import type { CreateNoteInput, NoteRepository, NoteRow } from "@/domain/ports/note-repository";

/**
 * Supabase-backed NoteRepository — RLS-scoped to the owning user.
 */
export class SupabaseNoteRepository implements NoteRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async listForUser(_userId: string): Promise<NoteRow[]> {
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as NoteRow[];
  }

  async create(input: CreateNoteInput): Promise<void> {
    const { error } = await this.supabase.from("notes").insert({
      user_id: input.userId,
      title: input.title,
      body: input.body,
      kind: input.kind,
    });
    if (error) throw new Error(error.message);
  }

  async delete(_userId: string, noteId: string): Promise<void> {
    const { error } = await this.supabase.from("notes").delete().eq("id", noteId);
    if (error) throw new Error(error.message);
  }
}