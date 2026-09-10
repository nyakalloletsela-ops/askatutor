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
        const { buildPublicDependencies } = await import("@/infrastructure/di");
        const paymentGateway = buildPublicDependencies().paymentGateway;

        const rawBody = await request.text();
        let event: { event_type?: string; resource?: Record<string, unknown> };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const ok = await paymentGateway.verifyWebhook({
          provider: "paypal",
          headers: request.headers,
          rawBody,
        });
        if (!ok) return new Response("Invalid signature", { status: 401 });

        const action = paymentGateway.resolveWebhookAction(event);

        try {
          if (action.kind === "finalize") {
            await paymentGateway.finalizeCapture({
              intentId: action.customId,
              provider: "paypal",
              providerRef: action.providerRef,
            });
          } else if (action.kind === "refund") {
            await paymentGateway.refundPayment({
              intentId: action.intentId,
              reason: action.reason,
            });
          } else if (action.kind === "mark_failed") {
            await paymentGateway.markPaymentFailed({
              intentId: action.intentId,
              reason: action.reason,
            });
          }
        } catch (e) {
          // Do not acknowledge downstream processing failures. A 2xx response
          // tells PayPal the event was handled and can suppress provider retry.
          // The payment operations are designed to be idempotent, so transient
          // failures should be retried by the provider instead.
          console.error("[paypal webhook] action error:", e);
          return new Response("Webhook processing failed", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
