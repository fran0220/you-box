/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
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
