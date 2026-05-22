import { supabase } from '@/integrations/supabase/client'

interface SendParams {
  templateName: string
  recipientEmail: string
  idempotencyKey?: string
  templateData?: Record<string, any>
  fromAlias?: 'noreply' | 'admin' | 'help' | 'tutors' | 'students' | 'billing'
}

/** Authenticated send (requires logged-in user). */
export async function sendTransactionalEmail(params: SendParams) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await fetch('/lovable/email/transactional/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`Email send failed: ${res.status}`)
  return res.json()
}
