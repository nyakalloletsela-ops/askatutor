import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { supabaseAdmin } from '@/integrations/supabase/client.server'

const HelpSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(5).max(5000),
  user_id: z.string().uuid().nullable().optional(),
})

/**
 * Public help-message submission. Inserts the message and triggers two emails:
 * a confirmation to the sender (from help@) and an admin notification
 * (from help@, to help@askatutorlive.com).
 */
export const submitHelpMessage = createServerFn({ method: 'POST' })
  .inputValidator((input) => HelpSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from('help_messages')
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        body: data.body,
        user_id: data.user_id ?? null,
      })
      .select('id')
      .single()
    if (error) throw new Error(error.message)

    const origin =
      process.env.SITE_URL ||
      `https://${process.env.VITE_PUBLIC_DOMAIN || 'www.askatutorlive.com'}`

    const headers = { 'Content-Type': 'application/json' } as Record<string, string>
    const baseSend = async (payload: unknown) => {
      try {
        await fetch(`${origin}/lovable/email/transactional/send-internal`, {
          method: 'POST',
          headers: { ...headers, 'X-Internal-Key': process.env.SUPABASE_SERVICE_ROLE_KEY ?? '' },
          body: JSON.stringify(payload),
        })
      } catch (e) {
        console.error('help email send failed', e)
      }
    }

    await Promise.all([
      baseSend({
        templateName: 'help-confirmation',
        recipientEmail: data.email,
        idempotencyKey: `help-confirm-${row.id}`,
        templateData: { name: data.name, subject: data.subject, body: data.body },
        fromAlias: 'help',
      }),
      baseSend({
        templateName: 'help-new-ticket',
        recipientEmail: 'help@askatutorlive.com',
        idempotencyKey: `help-notify-${row.id}`,
        templateData: { name: data.name, email: data.email, subject: data.subject, body: data.body },
        fromAlias: 'help',
      }),
    ])

    return { id: row.id }
  })
