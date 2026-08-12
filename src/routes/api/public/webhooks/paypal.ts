import { createFileRoute } from "@tanstack/react-router";

/**
 * PayPal webhook receiver. Verifies the signature, then maps the event to a
 * single safe action:
 *  - PAYMENT.CAPTURE.COMPLETED   -> finalize_payment_succeeded (credit ledger)
 *  - PAYMENT.CAPTURE.REFUNDED / REVERSED -> refund_payment (reverse ledger)
 *  - PAYMENT.CAPTURE.DENIED / DECLINED   -> mark_payment_failed
 *  - CHECKOUT.ORDER.APPROVED and anything else -> ignored (order approval is
 *    NOT a capture; money must move before the ledger is credited).
 *
 * finalize_payment_succeeded and refund_payment are idempotent — replaying a
 * webhook or the return-URL flow is safe.
 *
 * Endpoint URL (paste into PayPal Developer → Webhooks):
 *   https://<your-domain>/api/public/webhooks/paypal
 */
export const Route = createFileRoute("/api/public/webhooks/paypal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        let event: { event_type?: string; resource?: Record<string, unknown> };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: provider } = await supabaseAdmin
          .from("payment_providers")
          .select("mode, credentials_ref")
          .eq("slug", "paypal")
          .maybeSingle();
        if (!provider || !provider.credentials_ref) {
          return new Response("PayPal not configured", { status: 503 });
        }

        const { paypalVerifyWebhook } = await import("@/lib/payments/paypal.server");
        const ok = await paypalVerifyWebhook({
          mode: provider.mode as "sandbox" | "live",
          credentialsRef: provider.credentials_ref,
          headers: request.headers,
          rawBody,
        });
        if (!ok) return new Response("Invalid signature", { status: 401 });

        const { resolvePaypalWebhookAction } = await import("@/lib/payments/webhook-actions");
        const action = resolvePaypalWebhookAction(event);

        try {
          if (action.kind === "finalize") {
            await supabaseAdmin.rpc("finalize_payment_succeeded", {
              _intent: action.customId,
              _provider: "paypal",
              _provider_ref: action.providerRef,
            });
          } else if (action.kind === "refund") {
            await supabaseAdmin.rpc("refund_payment", {
              _intent: action.intentId,
              _reason: action.reason,
            });
          } else if (action.kind === "mark_failed") {
            await supabaseAdmin.rpc("mark_payment_failed", {
              _intent: action.intentId,
              _reason: action.reason,
            });
          }
        } catch (e) {
          // Unknown intent or already-finalized — log only, never crash the
          // webhook (PayPal retries otherwise).
          console.error("[paypal webhook] action error:", e);
        }

        return new Response("ok");
      },
    },
  },
});
