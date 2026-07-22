import z from 'zod'
import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * Maps classic frontend setting tabs (/console/setting?tab=xxx) to the
 * system-settings group/section that owns the equivalent configuration.
 */
const LEGACY_TAB_MAP: Record<string, string> = {
  operation: '/system-settings/operations/behavior',
  dashboard: '/system-settings/content/dashboard',
  chats: '/system-settings/content/chat',
  drawing: '/system-settings/content/drawing',
  payment: '/system-settings/billing/payment',
  ratio: '/system-settings/billing/model-pricing',
  ratelimit: '/system-settings/security/rate-limit',
  models: '/system-settings/models/global',
  'model-deployment': '/system-settings/models/model-deployment',
  performance: '/system-settings/operations/performance',
  system: '/system-settings/site/system-info',
  other: '/system-settings/content/announcements',
}

const settingSearchSchema = z.object({
  tab: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/console/setting')({
  validateSearch: settingSearchSchema,
  beforeLoad: ({ search }) => {
    const mapped = search.tab ? LEGACY_TAB_MAP[search.tab] : undefined
    if (!mapped) {
      throw redirect({ to: '/system-settings' })
    }
    throw redirect({ href: mapped })
  },
})
