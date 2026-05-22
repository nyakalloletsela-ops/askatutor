import type { ComponentType } from 'react'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
  /** Role-based sender alias: noreply|admin|help|tutors|students|billing */
  fromAlias?: string
}

import { template as welcome } from './welcome'
import { template as helpConfirmation } from './help-confirmation'
import { template as helpNewTicket } from './help-new-ticket'
import { template as subscriptionApproved } from './subscription-approved'
import { template as subscriptionRejected } from './subscription-rejected'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'help-confirmation': helpConfirmation,
  'help-new-ticket': helpNewTicket,
  'subscription-approved': subscriptionApproved,
  'subscription-rejected': subscriptionRejected,
}
