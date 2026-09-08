import { describe, expect, test } from "bun:test";
import { resolvePaypalWebhookAction } from "../src/infrastructure/adapters/paypal-webhook-action";

const custom = (extra: Record<string, unknown> = {}) => ({
  event_type: "PAYMENT.CAPTURE.COMPLETED",
  resource: { id: "CAP-1", custom_id: "11111111-1111-4111-8111-111111111111", ...extra },
});

describe("resolvePaypalWebhookAction", () => {
  test("capture completed finalizes (credits ledger) with custom id + capture ref", () => {
    expect(resolvePaypalWebhookAction(custom())).toEqual({
      kind: "finalize",
      customId: "11111111-1111-4111-8111-111111111111",
      providerRef: "CAP-1",
    });
  });

  test("capture completed falls back to order_id from supplementary data", () => {
    const evt = {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "CAP-9",
        supplementary_data: { related_ids: { order_id: "11111111-1111-4111-8111-111111111111" } },
      },
    };
    expect(resolvePaypalWebhookAction(evt)).toEqual({
      kind: "finalize",
      customId: "11111111-1111-4111-8111-111111111111",
      providerRef: "CAP-9",
    });
  });

  test("capture completed without a provider ref is ignored", () => {
    const evt = { event_type: "PAYMENT.CAPTURE.COMPLETED", resource: { custom_id: "x" } };
    expect(resolvePaypalWebhookAction(evt)).toEqual({ kind: "ignore" });
  });

  test("CHECKOUT.ORDER.APPROVED is IGNORED (approval is not a capture)", () => {
    const evt = {
      event_type: "CHECKOUT.ORDER.APPROVED",
      resource: {
        custom_id: "11111111-1111-4111-8111-111111111111",
        id: "ORDER-1",
      },
    };
    expect(resolvePaypalWebhookAction(evt)).toEqual({ kind: "ignore" });
  });

  test("capture refunded triggers a ledger reversal", () => {
    const evt = { ...custom(), event_type: "PAYMENT.CAPTURE.REFUNDED" };
    expect(resolvePaypalWebhookAction(evt)).toEqual({
      kind: "refund",
      intentId: "11111111-1111-4111-8111-111111111111",
      reason: "PayPal: PAYMENT.CAPTURE.REFUNDED",
    });
  });

  test("capture reversed triggers a ledger reversal", () => {
    const evt = { ...custom(), event_type: "PAYMENT.CAPTURE.REVERSED" };
    expect(resolvePaypalWebhookAction(evt).kind).toBe("refund");
  });

  test("capture denied / declined mark the intent failed", () => {
    for (const t of ["PAYMENT.CAPTURE.DENIED", "PAYMENT.CAPTURE.DECLINED"]) {
      const action = resolvePaypalWebhookAction({ ...custom(), event_type: t });
      expect(action).toMatchObject({ kind: "mark_failed", intentId: expect.any(String) });
    }
  });

  test("unknown event types are ignored", () => {
    expect(resolvePaypalWebhookAction({ event_type: "SOMETHING.ELSE", resource: {} })).toEqual({
      kind: "ignore",
    });
  });
});
