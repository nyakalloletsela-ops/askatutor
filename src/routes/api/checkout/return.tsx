import { createFileRoute } from "@tanstack/react-router";

/**
 * Return URL hit by PayPal after the buyer approves the payment.
 * We capture the order, finalize the intent + ledger, then redirect the
 * user back into the app.
 */
export const Route = createFileRoute("/api/checkout/return")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { buildPublicDependencies } = await import("@/infrastructure/di");
        const paymentGateway = buildPublicDependencies().paymentGateway;

        const url = new URL(request.url);
        const intentId = url.searchParams.get("intent");
        const paypalToken = url.searchParams.get("token"); // PayPal order id
        const origin = `${url.protocol}//${url.host}`;

        if (!intentId || !paypalToken) {
          return Response.redirect(`${origin}/checkout/failed?reason=missing_params`, 302);
        }

        try {
          const intent = await paymentGateway.getIntent(intentId);
          if (!intent) {
            return Response.redirect(`${origin}/checkout/failed?reason=intent_not_found`, 302);
          }
          if (intent.status === "succeeded") {
            return Response.redirect(`${origin}/checkout/success?intent=${intentId}`, 302);
          }
          if (!intent.provider) {
            return Response.redirect(`${origin}/checkout/failed?reason=provider_missing`, 302);
          }

          if (intent.provider === "paypal") {
            let cap;
            try {
              cap = await paymentGateway.captureOrder({
                provider: "paypal",
                orderId: paypalToken,
              });
            } catch (captureErr) {
              // Race with the webhook: if the capture was already completed
              // (webhook finalized it first), the capture call may error with
              // 422. Verify the order state before deciding.
              cap = await paymentGateway.getOrder({
                provider: "paypal",
                orderId: paypalToken,
              });
              if (cap.status !== "COMPLETED") throw captureErr;
            }
            if (cap.status !== "COMPLETED") {
              await paymentGateway.markPaymentFailed({
                intentId,
                reason: `PayPal capture status: ${cap.status}`,
              });
              return Response.redirect(
                `${origin}/checkout/failed?reason=capture_${cap.status.toLowerCase()}`,
                302,
              );
            }
            await paymentGateway.finalizeCapture({
              intentId,
              provider: "paypal",
              providerRef: cap.captureId ?? paypalToken,
            });
            return Response.redirect(`${origin}/checkout/success?intent=${intentId}`, 302);
          }

          return Response.redirect(`${origin}/checkout/failed?reason=unknown_provider`, 302);
        } catch (e) {
          const msg = encodeURIComponent(e instanceof Error ? e.message : "capture_error");
          return Response.redirect(`${origin}/checkout/failed?reason=${msg}`, 302);
        }
      },
    },
  },
});