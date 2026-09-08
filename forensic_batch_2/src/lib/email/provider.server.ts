/**
 * Email Provider Adapter (server-only)
 * ------------------------------------
 * Single seam between the app and the transactional-email backend.
 * Self-hosted: no platform services involved.
 *
 * Providers (EMAIL_PROVIDER):
 *   resend  (default) -> Resend REST API. Needs RESEND_API_KEY.
 *   smtp              -> HTTP-to-SMTP bridge via SMTP_RELAY_URL (optional).
 *   none              -> sends are skipped and logged (useful for local dev).
 *
 * Templates live in `src/lib/email-templates/` and are rendered with
 * @react-email/render. App code calls `sendTransactionalEmail()`.
 * See DEPLOYMENT.md.
 */

export interface TransactionalEmail {
  templateName: string;
  recipientEmail: string;
  /** Passed to the provider as a tag so retries can be de-duplicated. */
  idempotencyKey: string;
  templateData: Record<string, unknown>;
  /** Optional mailbox alias (noreply, help, billing, …). */
  fromAlias?: string;
}

export type EmailProvider = "resend" | "smtp" | "none";

export function emailProvider(): EmailProvider {
  const v = (process.env.EMAIL_PROVIDER ?? "resend").toLowerCase();
  if (v === "smtp") return "smtp";
  if (v === "none" || v === "off" || v === "disabled") return "none";
  return "resend";
}

export function publicBaseUrl(): string {
  const v = process.env.PUBLIC_BASE_URL || process.env.VITE_PUBLIC_BASE_URL || "";
  return v.replace(/\/+$/, "");
}

export interface OutgoingEmail {
  to: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  /** Free-form label used as a provider tag (template name). */
  label?: string;
  idempotencyKey?: string;
}

export class EmailError extends Error {}

// ---------------------------------------------------------------------------
// Resend REST (no SDK dependency — plain fetch works in every runtime)
// ---------------------------------------------------------------------------

async function sendViaResend(mail: OutgoingEmail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new EmailError("RESEND_API_KEY is not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(mail.idempotencyKey ? { "Idempotency-Key": mail.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || mail.from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.label ? { tags: [{ name: "template", value: mail.label.slice(0, 60) }] } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new EmailError(`Resend rejected the message (${res.status}): ${body.slice(0, 300)}`);
  }
}

// ---------------------------------------------------------------------------
// Generic SMTP bridge — POSTs the message to an HTTP endpoint you control
// (e.g. a tiny nodemailer service next to the app). Optional.
// ---------------------------------------------------------------------------

async function sendViaSmtpBridge(mail: OutgoingEmail): Promise<void> {
  const url = process.env.SMTP_RELAY_URL;
  if (!url) throw new EmailError("EMAIL_PROVIDER=smtp but SMTP_RELAY_URL is not configured");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.SMTP_RELAY_TOKEN
        ? { Authorization: `Bearer ${process.env.SMTP_RELAY_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(mail),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new EmailError(`SMTP relay failed (${res.status}): ${body.slice(0, 300)}`);
  }
}

/** Low-level delivery. Throws on provider failure. */
export async function deliverEmail(mail: OutgoingEmail): Promise<void> {
  switch (emailProvider()) {
    case "resend":
      return sendViaResend(mail);
    case "smtp":
      return sendViaSmtpBridge(mail);
    case "none":
      console.warn("[email] EMAIL_PROVIDER=none — skipping send", {
        template: mail.label,
        subject: mail.subject,
      });
      return;
  }
}

/**
 * Public API used by app server functions. Renders the registered template
 * and delivers it. Never throws — failures are logged so a booking/help flow
 * is not aborted by an email outage.
 */
export async function sendTransactionalEmail(payload: TransactionalEmail): Promise<void> {
  try {
    const { enqueueTransactionalEmail } = await import("./enqueue.server");
    await enqueueTransactionalEmail({
      templateName: payload.templateName,
      recipientEmail: payload.recipientEmail,
      idempotencyKey: payload.idempotencyKey,
      templateData: payload.templateData,
      fromAlias: payload.fromAlias,
    });
  } catch (e) {
    console.error("[email] send failed", payload.templateName, e);
  }
}
