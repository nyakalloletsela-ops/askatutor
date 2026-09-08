import type { UserDataClient } from "./helpers";
import type { Json } from "@/integrations/supabase/types";
import type { JsonValue } from "@/domain/ports/json";
import type {
  ChatMessageInput,
  ClassroomFile,
  ClassroomRepository,
  WhiteboardSnapshot,
} from "@/domain/ports/classroom-repository";

const BUCKET = "classroom-files";

/**
 * Supabase-backed ClassroomRepository — live chat, shared-file storage and
 * whiteboard snapshot persistence, all scoped by the RLS caller client.
 */
export class SupabaseClassroomRepository implements ClassroomRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async sendChatMessage(input: ChatMessageInput): Promise<void> {
    const { error } = await this.supabase.from("classroom_chat").insert({
      room_id: input.roomId,
      user_id: input.userId,
      display_name: input.displayName,
      body: input.body,
    });
    if (error) throw new Error(error.message);
  }

  async listFiles(roomId: string): Promise<ClassroomFile[]> {
    const prefix = `${roomId}/`;
    const { data: files, error } = await this.supabase.storage
      .from(BUCKET)
      .list(prefix, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw new Error(error.message);
    return (files ?? []).filter(
      (f) => f.name !== ".emptyFolderPlaceholder",
    ) as unknown as ClassroomFile[];
  }

  async getFileUrl(path: string): Promise<string> {
    const { data: result, error } = await this.supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, 3600);
    if (error) throw new Error(error.message);
    return result.signedUrl;
  }

  async deleteFile(path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(BUCKET).remove([path]);
    if (error) throw new Error(error.message);
  }

  async loadWhiteboard(roomId: string): Promise<WhiteboardSnapshot | null> {
    const { data: wbId } = await this.supabase.rpc("ensure_whiteboard", {
      _room_id: roomId,
    });
    if (!wbId) return null;

    const { data: snap } = await this.supabase
      .from("whiteboard_snapshots")
      .select("snapshot_data, created_at")
      .eq("whiteboard_id", wbId as string)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return (snap as unknown as WhiteboardSnapshot | null) ?? null;
  }

  async saveWhiteboard(roomId: string, snapshotData: JsonValue): Promise<void> {
    const { data: wbId } = await this.supabase.rpc("ensure_whiteboard", {
      _room_id: roomId,
    });
    if (!wbId) throw new Error("Could not create whiteboard");

    const { error } = await this.supabase.from("whiteboard_snapshots").insert({
      whiteboard_id: wbId as string,
      snapshot_data: snapshotData as unknown as Json,
    });
    if (error) throw new Error(error.message);
  }
}
