/**
 * AiKeyRepository port — admin-managed per-provider credentials plus the
 * presence of environment-provided fallback keys. Environment reads happen in
 * the Infrastructure implementation.
 */
export type AiProvider = "groq" | "gemini" | "ollama";

export interface AiKeyRow {
  provider: string;
  api_key: string | null;
  base_url: string | null;
  updated_at: string | null;
}

export interface EnvKeyPresence {
  groq: string | null;
  gemini: string | null;
  ollamaBaseUrl: string | null;
}

export interface AiKeyUpsertInput {
  provider: AiProvider;
  apiKey: string | null;
  baseUrl: string | null;
  updatedBy: string;
}

export interface AiKeyRepository {
  upsert(input: AiKeyUpsertInput): Promise<void>;
  list(): Promise<AiKeyRow[]>;
  envKeyPresence(): Promise<EnvKeyPresence>;
}