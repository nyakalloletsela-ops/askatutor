import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/** The RLS-scoped (authenticated caller) Supabase client. */
export type UserDataClient = SupabaseClient<Database>;

/** Serializes a numeric vector into the PostgreSQL vector literal form. */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.map((n) => (Number.isFinite(n) ? n.toFixed(8) : "0")).join(",")}]`;
}