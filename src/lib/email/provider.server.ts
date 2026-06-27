/**
 * Email Provider Adapter (server-only)
 * ------------------------------------
 * Single seam between the app and the transactional-email backend.
 *
 * TODAY:  Enqueues into the Lovable Emails pgmq queue by POSTing to
 *         `/lovable/email/transactional/send` with the service-role key.
 *         The queue route renders the template and ships via Lovable's
 *         managed sender.
 * LATER:  Set EMAIL_PROVIDER=resend and RESEND_API_KEY to send directly
 *         via Resend's REST API. Off-Lovable you also remove the queue
 *         route files; they're not used outside Lovable.
 *
 * App code calls `sendTransactionalEmail()` only. Templates stay where
 * they are (`src/lib/email-templates/*`). Booking/help/etc. server
 * functions stay untouched.
 *
 * See MIGRATION.md for the off-platform swap recipe.
 */

export interface TransactionalEmail {
  templateName: string;
  recipientEmail: string;
  /** Used for dedupe in the queue path; passed as a tag on Resend. */
  idempotencyKey: string;
  templateData: Record<string, unknown>;
}

function provider(): "lovable" | "resend" {
  return (process.env.EMAIL_PROVIDER ?? "lovable").toLowerCase() === "resend"
    ? "resend"
    : "lovable";
}

function publicBaseUrl(): string {
  return (
    process.env.PUBLIC_BASE_URL ||
    process.env.VITE_PUBLIC_BASE_URL ||
    "https://askatutor.lovable.app"
  );
}

// ---------------------------------------------------------------------------
// Lovable Emails (default)
// ---------------------------------------------------------------------------

async function sendViaLovableQueue(payload: TransactionalEmail): Promise<void> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("[email] missing SUPABASE_SERVICE_ROLE_KEY; skipping send");
    return;
  }
  try {
    const r = await fetch(`${publicBaseUrl()}/lovable/email/transactional/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      console.error("[email] queue send failed", r.status, await r.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[email] queue send error", e);
  }
}

// ---------------------------------------------------------------------------
// Resend direct (activated on migration; STUB today)
// ---------------------------------------------------------------------------
//
// MIGRATION STEPS (off Lovable):
//   1. `bun add resend @react-email/render` (render stays the same).
//   2. Set env vars: EMAIL_PROVIDER=resend, RESEND_API_KEY=...,
//      RESEND_FROM="Ask A Tutor <notify@yourdomain.com>".
//   3. Implement `sendViaResend()` below: import the template module,
//      render it with `@react-email/render`, then call Resend's SDK.
//   4. Delete `src/routes/lovable/email/*` and the `email_send_log` /
//      `email_send_state` cron — Resend handles delivery directly.

async function sendViaResend(payload: TransactionalEmail): Promise<void> {
  // TODO on migration:
  //   const { Resend } = await import("resend");
  //   const { render } = await import("@react-email/render");
  //   const mod = await import(`@/lib/email-templates/${payload.templateName}`);
  //   const html = render(mod.default(payload.templateData));
  //   const resend = new Resend(process.env.RESEND_API_KEY!);
  //   await resend.emails.send({
  //     from: process.env.RESEND_FROM!,
  //     to: payload.recipientEmail,
  //     subject: mod.subject?.(payload.templateData) ?? "Ask A Tutor",
  //     html,
  //     tags: [{ name: "idempotency", value: payload.idempotencyKey }],
  //   });
  console.warn(
    "[email] EMAIL_PROVIDER=resend but adapter not wired yet — see MIGRATION.md",
    payload.templateName,
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendTransactionalEmail(payload: TransactionalEmail): Promise<void> {
  if (provider() === "resend") return sendViaResend(payload);
  return sendViaLovableQueue(payload);
}
