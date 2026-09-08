/**
 * SimulationRepository port — the Universal Simulation Lab's persisted
 * simulations, vector similarity lookup, listing and deletion.
 */
import type { JsonValue } from "@/domain/ports/json";

export interface SimulationRow {
  id: string;
  prompt: string;
  subject: string;
  title: string;
  schema_json: JsonValue;
  thumbnail_url: string | null;
  created_at: string;
  tags: string[];
  [key: string]: JsonValue;
}

export interface SaveSimulationInput {
  userId: string;
  prompt: string;
  subject: string;
  title: string;
  schema: JsonValue;
  embedding: number[] | null;
  thumbnailUrl: string | null;
  tags: string[];
}

export interface SimulationRepository {
  findSimilar(
    embedding: number[],
    minSimilarity: number,
  ): Promise<Record<string, JsonValue> | null>;
  save(input: SaveSimulationInput): Promise<SimulationRow>;
  list(opts: { search?: string; subject?: string }): Promise<SimulationRow[]>;
  delete(id: string): Promise<void>;
}
