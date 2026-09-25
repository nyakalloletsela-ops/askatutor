-- Self-service checkout (vertical slice): wire /pay-tutor bulk-lesson intents
-- into the online PaymentGateway flow.
--
-- 1. Re-grant create_bulk_lesson_intent to authenticated. The 2026-08-12 grant
--    hardening (revoke_public_execute_grants / harden_rpc_grants_and_guards)
--    revoked PUBLIC + anon and never re-granted it, so it is currently
--    unexecutable by everyone. Self-service students must create their OWN
--    intents (student_id = auth.uid(), scope-gated inside the RPC).
-- 2. Extend finalize_payment_succeeded (the PayPal webhook/return ledger path,
--    EXECUTE already granted to service_role) so a captured self-service bulk
--    payment ALSO credits the student's prepaid_lessons balance. Previously
--    only the admin-only confirm_bulk_lesson_intent created that reservation.

GRANT EXECUTE ON FUNCTION public.create_bulk_lesson_intent(uuid, integer, integer, text)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.finalize_payment_succeeded(
  _intent uuid,
  _provider text,
  _provider_ref text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _pi record; _hold int; _lessons int; _minutes int;
BEGIN
  SELECT * INTO _pi FROM public.payment_intents WHERE id = _intent FOR UPDATE;
  IF _pi.id IS NULL THEN RAISE EXCEPTION 'Intent % not found', _intent; END IF;
  IF _pi.status = 'succeeded' THEN RETURN; END IF;
  IF _pi.status <> 'pending' THEN
    RAISE EXCEPTION 'Intent % cannot transition from % to succeeded', _intent, _pi.status;
  END IF;

  SELECT payout_hold_hours INTO _hold FROM public.platform_config WHERE id=1;
  _hold := COALESCE(_hold, 72);

  UPDATE public.payment_intents
    SET status='succeeded',
        succeeded_at = now(),
        provider = _provider,
        provider_ref = _provider_ref,
        hold_until = now() + make_interval(hours => _hold)
    WHERE id = _intent;

  INSERT INTO public.ledger_entries
    (entry_type, amount_cents, currency, balance_type, payment_intent_id, description, metadata)
  VALUES
    ('credit', _pi.gross_cents, _pi.currency, 'platform', _pi.id,
     'Student payment captured', jsonb_build_object('provider', _provider, 'ref', _provider_ref));

  INSERT INTO public.ledger_entries
    (entry_type, amount_cents, currency, balance_type, tutor_id, payment_intent_id, description)
  VALUES
    ('credit', _pi.tutor_net_cents, _pi.currency, 'tutor_earnings',
     _pi.tutor_id, _pi.id, 'Tutor earnings');

  -- Bulk prepaid lessons: credit the student's balance for self-service payments
  -- (mirrors confirm_bulk_lesson_intent). Idempotent — one reservation per intent.
  IF (_pi.metadata->>'kind') = 'bulk_lessons'
     AND (_pi.metadata->>'lessons') IS NOT NULL
     AND (_pi.metadata->>'lesson_minutes') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM public.prepaid_lessons WHERE payment_intent_id = _pi.id
     ) THEN
    _lessons := (_pi.metadata->>'lessons')::int;
    _minutes := (_pi.metadata->>'lesson_minutes')::int;
    INSERT INTO public.prepaid_lessons
      (student_id, tutor_id, lessons_total, lessons_remaining, lesson_minutes,
       hourly_rate_cents, currency, payment_intent_id)
    VALUES
      (_pi.student_id, _pi.tutor_id, _lessons, _lessons, _minutes,
       CASE WHEN _lessons*_minutes>0
            THEN round(_pi.gross_cents::numeric / (_lessons * (_minutes::numeric/60.0)))::int
            ELSE 0 END,
       _pi.currency, _pi.id);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_payment_succeeded(uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_payment_succeeded(uuid,text,text) TO service_role;