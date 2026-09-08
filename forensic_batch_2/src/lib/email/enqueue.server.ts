import * as React from 'react'
import { render } from '@react-email/components'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { TEMPLATES, type TemplateEntry } from '@/lib/email-templates/registry'
import { deliverEmail, publicBaseUrl } from '@/lib/email/provider.server'

/**
 * Server-only transactional email sender.
 *
 * Renders a registered React Email template, honours the suppression list,
 * appends an unsubscribe footer, delivers through the configured provider
 * (see provider.server.ts) and records the outcome in `email_send_log`.
 *
 * Only call from trusted server code (server functions, webhooks).
 */

const FROM_DOMAIN = process.env.EMAIL_FROM_DOMAIN || 'askatutorlive.com'
const BRAND = process.env.EMAIL_FROM_NAME || 'Ask A Tutor'
const ALIAS_DISPLAY: Record<string, string> = {
  noreply: BRAND,
  admin: `${BRAND} Admin`,
  help: `${BRAND} Help`,
  tutors: `${BRAND} Tutors`,
  students: `${BRAND} Students`,
  billing: `${BRAND} Billing`,
}
const ALLOWED = new Set(Object.keys(ALIAS_DISPLAY))

function token32() {
  const b = new Uint8Array(32); crypto.getRandomValues(b)
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join('')
}

interface EnqueueParams {
  templateName: string
  recipientEmail: string
  idempotencyKey?: string
  templateData?: Record<string, any>
  fromAlias?: string
}

function unsubscribeFooter(token: string) {
  const base = publicBaseUrl()
  if (!base) return { html: '', text: '' }
  const url = `${base}/unsubscribe?token=${token}`
  return {
    html:
      `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;` +
      `font-family:Arial,sans-serif;font-size:12px;color:#6b7280">` +
      `You are receiving this email because of activity on your ${BRAND} account. ` +
      `<a href="${url}" style="color:#6b7280;text-decoration:underline">Unsubscribe</a>.` +
      `</div>`,
    text: `\n\n---\nUnsubscribe: ${url}\n`,
  }
}

export async function enqueueTransactionalEmail(p: EnqueueParams) {
  const tpl = TEMPLATES[p.templateName] as TemplateEntry & { fromAlias?: string } | undefined
  if (!tpl) throw new Error(`Unknown template: ${p.templateName}`)
  const recipient = tpl.to || p.recipientEmail
  if (!recipient) throw new Error('recipientEmail required')
  const normalized = recipient.toLowerCase()
  const messageId = crypto.randomUUID()

  // Suppression check
  const { data: sup } = await supabaseAdmin
    .from('suppressed_emails').select('id').eq('email', normalized).maybeSingle()
  if (sup) return { suppressed: true }

  // Unsubscribe token (one per email)
  let unsub: string
  const { data: existing } = await supabaseAdmin
    .from('email_unsubscribe_tokens').select('token, used_at').eq('email', normalized).maybeSingle()
  if (existing?.token && !existing.used_at) {
    unsub = existing.token
  } else {
    unsub = token32()
    await supabaseAdmin.from('email_unsubscribe_tokens')
      .upsert({ token: unsub, email: normalized }, { onConflict: 'email', ignoreDuplicates: true })
    const { data: re } = await supabaseAdmin
      .from('email_unsubscribe_tokens').select('token').eq('email', normalized).maybeSingle()
    unsub = re?.token ?? unsub
  }

  // Render
  const el = React.createElement(tpl.component, p.templateData ?? {})
  const footer = unsubscribeFooter(unsub)
  const html = (await render(el)) + footer.html
  const text = (await render(el, { plainText: true })) + footer.text
  const subject = typeof tpl.subject === 'function' ? tpl.subject(p.templateData ?? {}) : tpl.subject

  const aliasRaw = (p.fromAlias ?? tpl.fromAlias ?? 'noreply').toLowerCase()
  const alias = ALLOWED.has(aliasRaw) ? aliasRaw : 'noreply'

  try {
    await deliverEmail({
      to: recipient,
      from: `${ALIAS_DISPLAY[alias]} <${alias}@${FROM_DOMAIN}>`,
      subject,
      html,
      text,
      label: p.templateName,
      idempotencyKey: p.idempotencyKey ?? messageId,
    })
  } catch (e) {
    await supabaseAdmin.from('email_send_log').insert({
      message_id: messageId,
      template_name: p.templateName,
      recipient_email: recipient,
      status: 'failed',
      error_message: (e as Error).message.slice(0, 500),
    })
    throw e
  }

  await supabaseAdmin.from('email_send_log').insert({
    message_id: messageId,
    template_name: p.templateName,
    recipient_email: recipient,
    status: 'sent',
  })

  return { sent: true, messageId }
}
