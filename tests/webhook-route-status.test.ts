import { describe, expect, mock, test } from "bun:test";

const { Route } = await import(
  "../src/routes/api/public/webhooks/paypal"
);

const POST = Route.options.server.handlers.POST as (args: {
  request: Request;
}) => Promise<Response>;

async function post(body: string, headers: Record<string, string> = {}) {
  const req = new Request("https://example.com/api/public/webhooks/paypal", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body,
  });
  return POST({ request: req });
}

describe("paypal webhook route status codes", () => {
  test("invalid JSON returns 400", async () => {
    mock.module("@/infrastructure/di", () => ({
      buildPublicDependencies: () => ({ paymentGateway: {} }),
    }));
    const res = await post("{not json");
    expect(res.status).toBe(400);
  });

  test("invalid signature returns 401", async () => {
    mock.module("@/infrastructure/di", () => ({
      buildPublicDependencies: () => ({
        paymentGateway: { verifyWebhook: async () => false },
      }),
    }));
    const res = await post(JSON.stringify({ event_type: "x", resource: {} }));
    expect(res.status).toBe(401);
  });

  test("ignored event returns 200", async () => {
    mock.module("@/infrastructure/di", () => ({
      buildPublicDependencies: () => ({
        paymentGateway: {
          verifyWebhook: async () => true,
          resolveWebhookAction: () => ({ kind: "ignore" }),
        },
      }),
    }));
    const res = await post(
      JSON.stringify({ event_type: "CHECKOUT.ORDER.APPROVED", resource: {} }),
    );
    expect(res.status).toBe(200);
  });

  test("downstream processing failure returns 500", async () => {
    mock.module("@/infrastructure/di", () => ({
      buildPublicDependencies: () => ({
        paymentGateway: {
          verifyWebhook: async () => true,
          resolveWebhookAction: () => ({
            kind: "finalize",
            customId: "intent-1",
            providerRef: "cap-1",
          }),
          finalizeCapture: async () => {
            throw new Error("db down");
          },
        },
      }),
    }));
    const res = await post(
      JSON.stringify({ event_type: "PAYMENT.CAPTURE.COMPLETED", resource: {} }),
    );
    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Webhook processing failed");
  });
});