import type { UserDataClient } from "./helpers";
import { toVectorLiteral } from "./helpers";
import type { JsonValue } from "@/domain/ports/json";
import type { Json } from "@/integrations/supabase/types";
import type {
  SaveSimulationInput,
  SimulationRepository,
  SimulationRow,
} from "@/domain/ports/simulation-repository";

/**
 * Supabase-backed SimulationRepository — persisted simulations and vector
 * similarity lookup for the Universal Simulation Lab.
 */
export class SupabaseSimulationRepository implements SimulationRepository {
  constructor(private readonly supabase: UserDataClient) {}

  async findSimilar(
    embedding: number[],
    minSimilarity: number,
  ): Promise<Record<string, JsonValue> | null> {
    const { data: rows, error } = await this.supabase.rpc("match_simulations", {
      query_embedding: toVectorLiteral(embedding),
      match_count: 1,
      min_similarity: minSimilarity,
    });
    if (error) throw new Error(error.message);
    return ((rows && rows[0]) as Record<string, JsonValue> | null) ?? null;
  }

  async save(input: SaveSimulationInput): Promise<SimulationRow> {
    const { data, error } = await this.supabase
      .rpc("save_simulation_with_initial_version", {
        _save_request_id: input.requestId,
        _prompt: input.prompt,
        _subject: input.subject,
        _title: input.title,
        _schema_json: input.schema as unknown as Json,
        _embedding: input.embedding ? toVectorLiteral(input.embedding) : null,
        _thumbnail_url: input.thumbnailUrl,
        _tags: input.tags,
      })
      .single();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Simulation save returned no row");

    return data as unknown as SimulationRow;
  }

  async list(opts: { search?: string; subject?: string }): Promise<SimulationRow[]> {
    let q = this.supabase
      .from("simulations")
      .select("id, prompt, subject, title, thumbnail_url, created_at, schema_json, tags")
      .order("created_at", { ascending: false })
      .limit(50);
    if (opts.subject) q = q.eq("subject", opts.subject);
    if (opts.search) q = q.or(`title.ilike.%${opts.search}%,prompt.ilike.%${opts.search}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as SimulationRow[];
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("simulations").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }
}
