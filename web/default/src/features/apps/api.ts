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
