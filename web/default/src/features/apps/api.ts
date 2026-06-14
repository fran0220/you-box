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
import { api } from '@/lib/api'

/** A single row of the apps leaderboard (HTTP-Referer / X-Title attribution). */
export interface AppRankingRow {
  app: string
  total_tokens: number
  request_count: number
}

/**
 * Fetch the apps leaderboard. Pass a model name to scope it to that model.
 */
export async function getApps(
  model?: string,
  limit = 20
): Promise<AppRankingRow[]> {
  const res = await api.get('/api/apps', {
    params: { ...(model ? { model } : {}), limit },
  })
  return res.data?.success && Array.isArray(res.data.data) ? res.data.data : []
}
