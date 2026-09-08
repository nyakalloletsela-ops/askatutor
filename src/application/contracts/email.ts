/**
 * Email Service Contract
 *
 * Application-facing interface for transactional email delivery.
 * The Application Layer decides WHAT email to send and TO WHOM.
 * The Email Service (infrastructure) decides HOW it is delivered.
 */

export type EmailFromAlias = "noreply" | "admin" | "help" | "tutors" | "students" | "billing";

export interface SendEmailOptions {
  to: string[];
  template: string;
  from?: EmailFromAlias;
  props: Record<string, unknown>;
  /** Optional idempotency key to prevent duplicate sends. */
  idempotencyKey?: string;
}

/**
 * EmailService — the single seam between the Application Layer and email delivery.
 *
 * Implementations:
 * - Should render templates, check suppression lists, manage unsubscribes
 * - Should NEVER throw on delivery failure (best-effort)
 * - Should log outcomes for observability
 */
export interface EmailService {
  send(options: SendEmailOptions): Promise<void>;
}
