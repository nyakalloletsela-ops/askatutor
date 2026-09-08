import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/email/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { buildPublicDependencies } = await import("@/infrastructure/di");
        const emailSuppression = buildPublicDependencies().emailSuppression;

        const url = new URL(request.url)
        const token = url.searchParams.get('token')

        if (!token) {
          return Response.json({ error: 'Token is required' }, { status: 400 })
        }

        const status = await emailSuppression.checkUnsubscribeToken(token)
        if (!status.valid) {
          return Response.json({ error: 'Invalid or expired token' }, { status: 404 })
        }
        return Response.json({ valid: true })
      },

      POST: async ({ request }) => {
        const { buildPublicDependencies } = await import("@/infrastructure/di");
        const emailSuppression = buildPublicDependencies().emailSuppression;

        const url = new URL(request.url)
        let token: string | null = url.searchParams.get('token')

        const contentType = request.headers.get('content-type') ?? ''
        if (contentType.includes('application/x-www-form-urlencoded')) {
          const formText = await request.text()
          const params = new URLSearchParams(formText)
          if (!params.get('List-Unsubscribe')) {
            const formToken = params.get('token')
            if (formToken) {
              token = formToken
            }
          }
        } else {
          try {
            const body = await request.json()
            if (body.token) {
              token = body.token
            }
          } catch {
            // Fall through — token stays from query param
          }
        }

        if (!token) {
          return Response.json({ error: 'Token is required' }, { status: 400 })
        }

        const initial = await emailSuppression.checkUnsubscribeToken(token)
        if (!initial.valid) {
          if (initial.reason === 'already_unsubscribed') {
            return Response.json({ success: false, reason: 'already_unsubscribed' })
          }
          return Response.json({ error: 'Invalid or expired token' }, { status: 404 })
        }

        const result = await emailSuppression.consumeUnsubscribeToken(token)
        if (!result.success) {
          if (result.reason === 'already_unsubscribed') {
            return Response.json({ success: false, reason: 'already_unsubscribed' })
          }
          console.error('Failed to process unsubscribe', {
            reason: result.reason,
          })
          return Response.json({ error: 'Failed to process unsubscribe' }, { status: 500 })
        }

        console.log('Email unsubscribed')
        return Response.json({ success: true })
      },
    },
  },
})