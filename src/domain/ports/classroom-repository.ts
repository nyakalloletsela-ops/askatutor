/**
 * ClassroomRepository port — live classroom chat, shared files (storage), and
 * whiteboard snapshot persistence for the live workspace.
 */
import type { JsonValue } from "@/domain/ports/json";

export interface ClassroomFile {
  name: string;
  id?: string;
  created_at: string;
  updated_at?: string;
  metadata?: { size?: number } | null;
}

export interface WhiteboardSnapshot {
  snapshot_data: JsonValue;
  created_at: string;
}

export interface ChatMessageInput {
  roomId: string;
  userId: string;
  displayName: string;
  body: string;
}

export interface ClassroomRepository {
  sendChatMessage(input: ChatMessageInput): Promise<void>;
  listFiles(roomId: string): Promise<ClassroomFile[]>;
  getFileUrl(path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  loadWhiteboard(roomId: string): Promise<WhiteboardSnapshot | null>;
  saveWhiteboard(roomId: string, snapshotData: JsonValue): Promise<void>;
}
