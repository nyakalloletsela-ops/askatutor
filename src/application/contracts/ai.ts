/**
 * AI Gateway Contract
 *
 * Application-facing interface for all AI capabilities.
 * The Application Layer decides WHAT AI capability is requested.
 * The AI Gateway (infrastructure) decides HOW/WHERE it is executed.
 *
 * Provider selection, model mapping, fallback, retries, and
 * provider-specific details are ALL handled by the infrastructure adapter.
 */

export type AiContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface AiMessage {
  role: "system" | "user" | "assistant";
  content: string | AiContentPart[];
}

export interface AiChatOptions {
  model: string;
  messages: AiMessage[];
  temperature?: number;
  response_format?: { type: "json_object" };
  extra?: Record<string, unknown>;
}

export interface AiChatResult {
  text: string;
  raw: unknown;
}

export interface AiEmbedOptions {
  model: string;
  input: string | string[];
}

export interface AiEmbedResult {
  embedding: number[];
}

/**
 * AiGateway — the single seam between the Application Layer and AI providers.
 *
 * Implementations:
 * - Should handle provider resolution, credential management, model mapping
 * - Should handle retries, rate limiting, error translation
 * - Should NEVER leak provider-specific details to callers
 */
export interface AiProviderTestResult {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface AiGateway {
  chat(opts: AiChatOptions): Promise<AiChatResult>;
  embed(opts: AiEmbedOptions): Promise<AiEmbedResult>;
  testProvider(provider: "groq" | "gemini" | "ollama"): Promise<AiProviderTestResult>;
  clearCache(): void | Promise<void>;
}
