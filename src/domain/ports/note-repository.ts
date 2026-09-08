/**
 * NoteRepository port — the user's personal notes (RLS-scoped to the owner).
 */
import type { JsonValue } from "@/domain/ports/json";

export interface NoteRow {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  created_at: string;
  [key: string]: JsonValue;
}

export interface CreateNoteInput {
  userId: string;
  title: string;
  body: string;
  kind: string;
}

export interface NoteRepository {
  listForUser(userId: string): Promise<NoteRow[]>;
  create(input: CreateNoteInput): Promise<void>;
  delete(userId: string, noteId: string): Promise<void>;
}
