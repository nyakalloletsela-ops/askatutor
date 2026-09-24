import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireAppDependencies } from "@/integrations/auth/app-dependencies";

/**
 * Self-service checkout.
 *
 * Creates a prepaid bulk-lesson payment intent as the authenticated student
 * (amount and ownership are computed server-side by the RPC, never accepted
 * from the client) and starts an online payment through the PaymentGateway.
 * The returned `approvalUrl` sends the student to the provider to complete the
 * purchase.
 */

const LESSON_MINUTES = [30, 45, 60, 90, 120] as const;

const initiateCheckoutInput = z.object({
  tutorId: z.string().uuid(),
  lessons: z.number().int().min(1).max(100),
  lessonMinutes: z.union([
    z.literal(30),
    z.literal(45),
    z.literal(60),
    z.literal(90),
    z.literal(120),
  ]),
});

function resolveBaseUrl(request: Request | undefined): string {
  const configured = (process.env.PUBLIC_BASE_URL || process.env.VITE_PUBLIC_BASE_URL || "").trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (request) return new URL(request.url).origin;
  throw new Error("Cannot determine the app base URL for checkout callbacks.");
}

export const initiateCheckout = createServerFn({ method: "POST" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => initiateCheckoutInput.parse(input))
  .handler(async ({ context, data }) => {
    const { data: intentId, error: createError } = await context.supabase.rpc(
      "create_bulk_lesson_intent",
      {
        _tutor: data.tutorId,
        _lessons: data.lessons,
        _lesson_minutes: data.lessonMinutes,
        _method: "online",
      },
    );
    if (createError) throw new Error(createError.message);
    if (!intentId) throw new Error("Payment request could not be created.");

    const { data: intent, error: readError } = await context.supabase
      .from("payment_intents")
      .select("gross_cents, currency")
      .eq("id", intentId)
      .single();
    if (readError || !intent) throw new Error("Payment request could not be loaded.");

    const request = getRequest();
    const base = resolveBaseUrl(request);
    const result = await context.deps.paymentGateway.startCheckout({
      intentId,
      amountCents: intent.gross_cents,
      currency: intent.currency,
      returnUrl: `${base}/api/checkout/return?intent=${intentId}`,
      cancelUrl: `${base}/checkout/cancelled?intent=${intentId}`,
      description: `Prepaid lessons: ${data.lessons} x ${data.lessonMinutes} min`,
    });

    return { intentId, ...result };
  });

/**
 * Reads the authoritative state of one of the current student's payment
 * intents for the post-checkout confirmation page. Ownership is enforced by
 * the payment_intents RLS policies (student reads own); a caller can never see
 * another user's intent.
 */
export const getCheckoutState = createServerFn({ method: "GET" })
  .middleware([requireAppDependencies])
  .inputValidator((input) => z.object({ intentId: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: intent, error } = await context.supabase
      .from("payment_intents")
      .select("id, status, gross_cents, currency, provider, method, created_at")
      .eq("id", data.intentId)
      .maybeSingle();
    if (error || !intent) return null;
    return intent;
  });
