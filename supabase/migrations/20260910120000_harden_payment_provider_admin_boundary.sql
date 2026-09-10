-- Payment Security Audit — immediate provider-administration slice.
--
--   * Revoke authenticated (browser) table-wide SELECT on payment_providers.
--     The only browser read path becomes admin_list_payment_providers(), a
--     SECURITY DEFINER RPC that returns safe operational fields and never the
--     `config` column (no arbitrary JSON configuration to the frontend).
--   * Keep authenticated INSERT/UPDATE for the Admin Providers tab mutations;
--     the existing RLS policy "providers admin write" gates every row to admins,
--     so provider mutations remain admin-authorized only.
--   * Server/service-role provider reads (payment router + gateway adapter +
--     PayPal webhook) are untouched.
--   * credentials_ref remains a non-secret namespace reference; raw secrets are
--     never written to or returned from payment_providers.

REVOKE SELECT ON public.payment_providers FROM authenticated;

GRANT INSERT ON public.payment_providers TO authenticated;
GRANT UPDATE ON public.payment_providers TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_payment_providers()
RETURNS TABLE (
  id uuid,
  slug text,
  display_name text,
  is_enabled boolean,
  priority int,
  mode text,
  credentials_ref text,
  supported_methods text[],
  supported_currencies text[],
  supported_countries text[],
  supported_regions jsonb,
  success_count integer,
  failure_count integer,
  last_error text,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT
    p.id,
    p.slug,
    p.display_name,
    p.is_enabled,
    p.priority,
    p.mode,
    p.credentials_ref,
    p.supported_methods,
    p.supported_currencies,
    p.supported_countries,
    p.supported_regions,
    p.success_count,
    p.failure_count,
    p.last_error,
    p.last_success_at,
    p.last_failure_at,
    p.created_at,
    p.updated_at
  FROM public.payment_providers p
  ORDER BY p.priority ASC, p.display_name ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_payment_providers() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_payment_providers() TO authenticated;