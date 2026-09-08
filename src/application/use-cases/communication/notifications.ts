import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { requireAppDependencies } from '@/integrations/auth/app-dependencies'

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export const notifyBookingEmails = createServerFn({ method: 'POST' })
  .middleware([requireAppDependencies])
  .inputValidator((input) =>
    z.object({ sessionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { deps, userId } = context

    const session = await deps.session.getNotificationView(data.sessionId)
    if (!session) {
      console.error('notifyBookingEmails: session not found')
      return { ok: false }
    }

    const isParticipant =
      userId === session.tutor_id || userId === session.student_id
    if (!isParticipant) {
      const isAdmin = await deps.user.isAdmin(userId)
      if (!isAdmin) {
        return { ok: false, error: 'Forbidden' }
      }
    }

    const names = await deps.user.listProfileNames([session.tutor_id, session.student_id])
    const [tutorEmail, studentEmail] = await Promise.all([
      deps.user.getEmail(session.tutor_id),
      deps.user.getEmail(session.student_id),
    ])

    const when = formatWhen(session.scheduled_at)
    const tutorName = names[session.tutor_id]
    const studentName = names[session.student_id]

    const sends: Promise<void>[] = []
    if (studentEmail) {
      sends.push(
        deps.emailService.send({
          to: [studentEmail],
          template: 'booking-confirmation',
          idempotencyKey: `booking-${session.id}-student`,
          props: {
            recipientName: studentName,
            counterpartName: tutorName,
            subject: session.subject,
            scheduledAt: when,
            durationMin: session.duration_min,
            role: 'student',
          },
        }),
      )
    }
    if (tutorEmail) {
      sends.push(
        deps.emailService.send({
          to: [tutorEmail],
          template: 'booking-confirmation',
          idempotencyKey: `booking-${session.id}-tutor`,
          props: {
            recipientName: tutorName,
            counterpartName: studentName,
            subject: session.subject,
            scheduledAt: when,
            durationMin: session.duration_min,
            role: 'tutor',
          },
        }),
      )
    }
    await Promise.all(sends)
    return { ok: true }
  })