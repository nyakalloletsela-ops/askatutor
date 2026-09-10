-- Remove the legacy 'lovable' AI provider (Lovable-free cleanup).
-- App code (src/lib/ai/provider.server.ts) already defaults to 'gemini' and
-- maps any stored 'lovable' value to gemini at read time; this migration
-- cleans up the database surface so no Lovable value can be stored.
--
-- Order matters: rows are migrated BEFORE the new CHECK constraint is added.

UPDATE public.platform_config
  SET ai_provider = 'gemini'
  WHERE ai_provider = 'lovable';

ALTER TABLE public.platform_config
  DROP CONSTRAINT IF EXISTS platform_config_ai_provider_check;

ALTER TABLE public.platform_config
  ADD CONSTRAINT platform_config_ai_provider_check
  CHECK (ai_provider IN ('groq', 'gemini', 'ollama'));

ALTER TABLE public.platform_config
  ALTER COLUMN ai_provider SET DEFAULT 'gemini';
