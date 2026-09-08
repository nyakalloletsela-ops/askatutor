/**
 * Payment Gateway Contract
 *
 * Application-facing interface for payment operations.
 * The Application Layer decides WHAT payment to initiate.
 * The Payment Gateway (infrastructure) decides HOW it is processed.
 *
 * Provider SDK, API keys, webhook verification, provider credential lookup,
 * and payment gateway details are ALL handled by the infrastructure adapter.
 */

export type PaymentCurrency = string;
export type PaymentCountry = string;

export interface PaymentProvider {
  slug: string;
  displayName: string;
  isEnabled: boolean;
  priority: number;
  mode: "sandbox" | "live";
  supportedCurrencies: string[];
  supportedCountries: string[];
}

export interface CheckoutStartOptions {
  intentId: string;
  amountCents: number;
  currency: PaymentCurrency;
  country?: PaymentCountry;
  returnUrl: string;
  cancelUrl: string;
  description?: string;
}

export interface CheckoutStartResult {
  providerSlug: string;
  approvalUrl: string;
  providerRef: string;
}

/** Raw provider webhook event, provider-agnostic. */
export interface PaymentWebhookEvent {
  event_type?: string;
  resource?: Record<string, unknown>;
}

/** The single safe action a webhook may map to. */
export type PaymentWebhookAction =
  | { kind: "finalize"; customId: string; providerRef: string }
  | { kind: "refund"; intentId: string; reason: string }
  | { kind: "mark_failed"; intentId: string; reason: string }
  | { kind: "ignore" };

export interface CaptureResult {
  status: string;
  captureId?: string;
}

/** Payment intent read model. */
export interface PaymentIntentView {
  id: string;
  provider: string | null;
  provider_ref: string | null;
  status: string | null;
}

export interface PaymentGateway {
  /**
   * Selects available providers for the given currency/country,
   * tries them in priority order, and returns the first successful result.
   */
  startCheckout(opts: CheckoutStartOptions): Promise<CheckoutStartResult>;

  /** Verifies an incoming provider webhook signature (PayPal). */
  verifyWebhook(opts: { provider: string; headers: Headers; rawBody: string }): Promise<boolean>;

  /** Maps a provider webhook event to a single safe ledger action. */
  resolveWebhookAction(event: PaymentWebhookEvent): PaymentWebhookAction;

  /** Reads the current state of an intent by its id. */
  getIntent(intentId: string): Promise<PaymentIntentView | null>;

  /** Captures an approved order with the given provider. */
  captureOrder(opts: { provider: string; orderId: string }): Promise<CaptureResult>;

  /** Reads the current state of an order with the given provider. */
  getOrder(opts: { provider: string; orderId: string }): Promise<CaptureResult>;

  /** Idempotently credits the ledger for a successful capture. */
  finalizeCapture(opts: { intentId: string; provider: string; providerRef: string }): Promise<void>;

  /** Idempotently reverses the ledger for a refund. */
  refundPayment(opts: { intentId: string; reason: string }): Promise<void>;

  /** Marks an intent failed. */
  markPaymentFailed(opts: { intentId: string; reason: string }): Promise<void>;
}