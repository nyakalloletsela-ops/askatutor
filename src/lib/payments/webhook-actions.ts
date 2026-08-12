export type PaypalWebhookEvent = {
  event_type?: string;
  resource?: Record<string, unknown>;
};

export type WebhookAction =
  | { kind: "finalize"; customId: string; providerRef: string }
  | { kind: "refund"; intentId: string; reason: string }
  | { kind: "mark_failed"; intentId: string; reason: string }
  | { kind: "ignore" };

function readCustomId(resource: Record<string, unknown>): string | undefined {
  return (
    (resource.custom_id as string | undefined) ??
    (resource as { supplementary_data?: { related_ids?: { order_id?: string } } })
      .supplementary_data?.related_ids?.order_id
  );
}

/**
 * Maps a PayPal webhook event to a single, safe database action.
 *
 * Money only ever moves on real capture events:
 *  - PAYMENT.CAPTURE.COMPLETED  -> finalize (credit ledger)
 *  - PAYMENT.CAPTURE.REFUNDED/REVERSED -> refund (reverse ledger)
 *  - PAYMENT.CAPTURE.DENIED/DECLINED   -> mark_failed
 *  - CHECKOUT.ORDER.APPROVED and everything else -> ignore. An approved order
 *    is NOT a capture; finalizing on APPROVED credited the ledger before money
 *    moved (the previous P0-3 bug).
 */
export function resolvePaypalWebhookAction(event: PaypalWebhookEvent): WebhookAction {
  const type = event.event_type ?? "";
  const resource = (event.resource ?? {}) as Record<string, unknown>;

  if (type === "PAYMENT.CAPTURE.COMPLETED") {
    const customId = readCustomId(resource);
    const providerRef =
      (resource.id as string | undefined) ??
      (resource as { invoice_id?: string }).invoice_id;
    if (customId && providerRef) return { kind: "finalize", customId, providerRef };
    return { kind: "ignore" };
  }

  if (type === "PAYMENT.CAPTURE.REFUNDED" || type === "PAYMENT.CAPTURE.REVERSED") {
    const customId = readCustomId(resource);
    if (customId) return { kind: "refund", intentId: customId, reason: `PayPal: ${type}` };
    return { kind: "ignore" };
  }

  if (type === "PAYMENT.CAPTURE.DENIED" || type === "PAYMENT.CAPTURE.DECLINED") {
    const customId = readCustomId(resource);
    if (customId) return { kind: "mark_failed", intentId: customId, reason: `PayPal: ${type}` };
    return { kind: "ignore" };
  }

  return { kind: "ignore" };
}
