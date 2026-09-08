import type { UserDataClient } from "./helpers";
import { toVectorLiteral } from "./helpers";
import type { Json } from "@/integrations/supabase/types";
import type { JsonValue } from "@/domain/ports/json";
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
    const insert = {
      user_id: input.userId,
      prompt: input.prompt,
      subject: input.subject,
      title: input.title,
      schema_json: input.schema as unknown as Json,
      embedding: input.embedding ? toVectorLiteral(input.embedding) : null,
      thumbnail_url: input.thumbnailUrl ?? null,
      tags: input.tags,
      processed: true,
      ai_schema_version: 2,
    };

    const { data: row, error } = await this.supabase
      .from("simulations")
      .insert(insert)
      .select("id, prompt, subject, title, schema_json, thumbnail_url, created_at, tags")
      .single();
    if (error) throw new Error(error.message);

    const saved = row as unknown as { id: string };
    await this.supabase.from("simulation_versions").insert({
      simulation_id: saved.id,
      user_id: input.userId,
      schema_json: input.schema as unknown as Json,
      prompt: input.prompt,
      version_number: 1,
    });

    return row as unknown as SimulationRow;
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
