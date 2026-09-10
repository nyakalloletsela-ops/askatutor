CREATE TABLE IF NOT EXISTS public.ai_provider_keys (
  provider text PRIMARY KEY,
  api_key text,
  base_url text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_provider_keys TO authenticated;
GRANT ALL ON public.ai_provider_keys TO service_role;
ALTER TABLE public.ai_provider_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read ai keys" ON public.ai_provider_keys FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write ai keys" ON public.ai_provider_keys FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));