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
import { useAuthStore } from '@/stores/auth-store'
import { getFreshModuleAccess } from '@/lib/nav-modules'
import { ModelDetails } from '@/features/pricing/components/model-details'

// Mirrors the catalog index route's search schema so the detail page can carry
// the active filters/sort/view back to `/pricing` ("Back to Models"). All array
// facets are comma-joined strings owned by the filter hook; ranges are numbers.
const modelDetailsSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
  sort: z.string().optional().catch(undefined),
  providers: z.string().optional().catch(undefined),
  groups: z.string().optional().catch(undefined),
  categories: z.string().optional().catch(undefined),
  inputModalities: z.string().optional().catch(undefined),
  outputModalities: z.string().optional().catch(undefined),
  series: z.string().optional().catch(undefined),
  supportedParameters: z.string().optional().catch(undefined),
  endpointTypes: z.string().optional().catch(undefined),
  quotaTypes: z.string().optional().catch(undefined),
  ctxMin: z.number().optional().catch(undefined),
  ctxMax: z.number().optional().catch(undefined),
  priceMin: z.number().optional().catch(undefined),
  priceMax: z.number().optional().catch(undefined),
  tokenUnit: z.enum(['M', 'K']).optional().catch(undefined),
  view: z.enum(['card', 'table']).optional().catch(undefined),
  rechargePrice: z.boolean().optional().catch(undefined),
  model: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/pricing/$modelId/')({
  validateSearch: modelDetailsSearchSchema,
  beforeLoad: async ({ location }) => {
    const access = await getFreshModuleAccess('pricing')
    if (!access.enabled) {
      throw redirect({ to: '/' })
    }
    if (access.requireAuth) {
      const { auth } = useAuthStore.getState()
      if (!auth.user) {
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }
  },
  component: ModelDetails,
})
