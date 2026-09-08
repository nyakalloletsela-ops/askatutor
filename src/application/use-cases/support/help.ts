import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAppDependencies, requirePublicDependencies } from '@/integrations/auth/app-dependencies'

const HelpSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(200),
  body: z.string().trim().min(5).max(5000),
  user_id: z.string().uuid().nullable().optional(),
})

export const submitHelpMessage = createServerFn({ method: 'POST' })
  .middleware([requirePublicDependencies])
  .inputValidator((input) => HelpSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { id } = await context.deps.help.createMessage({
      name: data.name,
      email: data.email,
      subject: data.subject,
      body: data.body,
      userId: data.user_id ?? null,
    })

    await Promise.all([
      context.deps.emailService.send({
        to: [data.email],
        template: 'help-confirmation',
        idempotencyKey: `help-confirm-${id}`,
        props: { name: data.name, subject: data.subject, body: data.body },
        from: 'help',
      }).catch((e: any) => console.error('help-confirmation send failed', e)),
      context.deps.emailService.send({
        to: ['help@askatutorlive.com'],
        template: 'help-new-ticket',
        idempotencyKey: `help-notify-${id}`,
        props: { name: data.name, email: data.email, subject: data.subject, body: data.body },
        from: 'help',
      }).catch((e: any) => console.error('help-new-ticket send failed', e)),
    ])

    return { id }
  })

const SubEmailSchema = z.object({
  tutor_id: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  amount: z.number().optional(),
  reason: z.string().max(500).optional(),
})

export const sendSubscriptionDecisionEmail = createServerFn({ method: 'POST' })
  .middleware([requireAppDependencies])
  .inputValidator((input) => SubEmailSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { deps, userId } = context
    const isAdmin = await deps.user.isAdmin(userId)
    if (!isAdmin) throw new Error('Forbidden')

    const name = await deps.user.getProfileName(data.tutor_id)
    const email = await deps.user.getEmail(data.tutor_id)
    if (!email) throw new Error('Tutor email not found')

    await deps.emailService.send({
      to: [email],
      template: data.status === 'approved' ? 'subscription-approved' : 'subscription-rejected',
      idempotencyKey: `sub-${data.status}-${data.tutor_id}-${Date.now()}`,
      props: { name: name ?? undefined, amount: data.amount ?? 250, reason: data.reason },
      from: 'billing',
    })
    return { ok: true }
  })