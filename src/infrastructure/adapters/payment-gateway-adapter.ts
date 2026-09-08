import type {
  PaymentGateway,
  CheckoutStartOptions,
  CheckoutStartResult,
  PaymentWebhookEvent,
  PaymentWebhookAction,
  CaptureResult,
  PaymentIntentView,
} from "@/application/contracts/payments";
import { resolvePaypalWebhookAction } from "@/infrastructure/adapters/paypal-webhook-action";

/**
 * PaymentGateway adapter — bridges the PaymentGateway contract to the
 * existing payment router + provider infrastructure.
 *
 * Provider selection (smart-score), PayPal SDK calls, and attempt
 * logging all live in @/lib/payments/router.server and paypal.server.
 * This adapter delegates, satisfying the contract boundary. Ledger RPCs
 * (finalize/refund/mark-failed) run through the service-role client here in
 * Infrastructure — Application only ever sees the opaque contract.
 */
export function createPaymentGateway(): PaymentGateway {
  return {
    async startCheckout(opts: CheckoutStartOptions): Promise<CheckoutStartResult> {
      const { routeCheckoutStart } = await import("@/lib/payments/router.server");
      return routeCheckoutStart({
        intentId: opts.intentId,
        amountCents: opts.amountCents,
        currency: opts.currency,
        country: opts.country,
        returnUrl: opts.returnUrl,
        cancelUrl: opts.cancelUrl,
        description: opts.description,
      });
    },

    async verifyWebhook({ provider, headers, rawBody }): Promise<boolean> {
      if (provider !== "paypal") return false;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: providerRow } = await supabaseAdmin
        .from("payment_providers")
        .select("mode, credentials_ref")
        .eq("slug", "paypal")
        .maybeSingle();
      if (!providerRow || !providerRow.credentials_ref) return false;
      const { paypalVerifyWebhook } = await import("@/lib/payments/paypal.server");
      return paypalVerifyWebhook({
        mode: providerRow.mode as "sandbox" | "live",
        credentialsRef: providerRow.credentials_ref,
        headers,
        rawBody,
      });
    },

    resolveWebhookAction(event: PaymentWebhookEvent): PaymentWebhookAction {
      const action = resolvePaypalWebhookAction(event as Parameters<typeof resolvePaypalWebhookAction>[0]);
      if (action.kind === "finalize") return { kind: "finalize", customId: action.customId, providerRef: action.providerRef };
      if (action.kind === "refund") return { kind: "refund", intentId: action.intentId, reason: action.reason };
      if (action.kind === "mark_failed") return { kind: "mark_failed", intentId: action.intentId, reason: action.reason };
      return { kind: "ignore" };
    },

    async getIntent(intentId: string): Promise<PaymentIntentView | null> {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data, error } = await supabaseAdmin
        .from("payment_intents")
        .select("id, provider, provider_ref, status")
        .eq("id", intentId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data as unknown as PaymentIntentView | null) ?? null;
    },

    async captureOrder({ provider, orderId }): Promise<CaptureResult> {
      if (provider !== "paypal") return { status: "UNKNOWN" };
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: providerRow } = await supabaseAdmin
        .from("payment_providers")
        .select("mode, credentials_ref")
        .eq("slug", "paypal")
        .maybeSingle();
      if (!providerRow || !providerRow.credentials_ref) return { status: "UNKNOWN" };
      const { paypalCaptureOrder } = await import("@/lib/payments/paypal.server");
      return paypalCaptureOrder({
        mode: providerRow.mode as "sandbox" | "live",
        credentialsRef: providerRow.credentials_ref,
        orderId,
      });
    },

    async getOrder({ provider, orderId }): Promise<CaptureResult> {
      if (provider !== "paypal") return { status: "UNKNOWN" };
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: providerRow } = await supabaseAdmin
        .from("payment_providers")
        .select("mode, credentials_ref")
        .eq("slug", "paypal")
        .maybeSingle();
      if (!providerRow || !providerRow.credentials_ref) return { status: "UNKNOWN" };
      const { paypalGetOrder } = await import("@/lib/payments/paypal.server");
      return paypalGetOrder({
        mode: providerRow.mode as "sandbox" | "live",
        credentialsRef: providerRow.credentials_ref,
        orderId,
      });
    },

    async finalizeCapture({ intentId, provider, providerRef }): Promise<void> {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.rpc("finalize_payment_succeeded", {
        _intent: intentId,
        _provider: provider,
        _provider_ref: providerRef,
      });
      if (error) throw new Error(error.message);
    },

    async refundPayment({ intentId, reason }): Promise<void> {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.rpc("refund_payment", {
        _intent: intentId,
        _reason: reason,
      });
      if (error) throw new Error(error.message);
    },

    async markPaymentFailed({ intentId, reason }): Promise<void> {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.rpc("mark_payment_failed", {
        _intent: intentId,
        _reason: reason,
      });
      if (error) throw new Error(error.message);
    },
  };
}