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
import { API_ENDPOINTS } from './constants'
import type { ModelPricing } from './lib/cost'
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelOption,
  GroupOption,
} from './types'

/**
 * Send chat completion request (non-streaming)
 */
export async function sendChatCompletion(
  payload: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const res = await api.post(API_ENDPOINTS.CHAT_COMPLETIONS, payload, {
    skipErrorHandler: true,
  } as Record<string, unknown>)
  return res.data
}

/**
 * Get user available models
 */
export async function getUserModels(): Promise<ModelOption[]> {
  const res = await api.get(API_ENDPOINTS.USER_MODELS)
  const { data } = res

  if (!data.success || !Array.isArray(data.data)) {
    return []
  }

  return data.data.map((model: string) => ({
    label: model,
    value: model,
  }))
}

/**
 * Get user groups
 */
export async function getUserGroups(): Promise<GroupOption[]> {
  const res = await api.get(API_ENDPOINTS.USER_GROUPS)
  const { data } = res

  if (!data.success || !data.data) {
    return []
  }

  const groupData = data.data as Record<string, { desc: string; ratio: number }>

  // label is for button display (name only); desc is for dropdown content
  return Object.entries(groupData).map(([group, info]) => ({
    label: group,
    value: group,
    ratio: info.ratio,
    desc: info.desc,
  }))
}

interface PricingRow {
  model_name: string
  quota_type: number
  model_ratio: number
  completion_ratio: number
  model_price?: number
  cache_ratio?: number | null
}

/**
 * Fetch per-model pricing and reduce it to the fields needed to derive a USD
 * cost from token usage. Keyed by model name.
 */
export async function getModelPricingMap(): Promise<
  Record<string, ModelPricing>
> {
  const res = await api.get(API_ENDPOINTS.PRICING)
  const { data } = res
  const rows: PricingRow[] = Array.isArray(data?.data) ? data.data : []

  const map: Record<string, ModelPricing> = {}
  for (const row of rows) {
    if (!row?.model_name) continue
    map[row.model_name] = {
      quotaType: row.quota_type,
      modelRatio: row.model_ratio,
      completionRatio: row.completion_ratio,
      modelPrice: row.model_price,
      cacheRatio: row.cache_ratio,
    }
  }
  return map
}

// ---- Presets --------------------------------------------------------------

/** A saved playground preset as returned by the backend. */
export interface PlaygroundPreset {
  id: number
  name: string
  /** JSON string of the serialized preset payload (config + parameterEnabled). */
  config: string
  created_time: number
  updated_time: number
}

export async function getPresets(): Promise<PlaygroundPreset[]> {
  const res = await api.get('/api/preset/')
  return res.data?.success && Array.isArray(res.data.data) ? res.data.data : []
}

export async function createPreset(
  name: string,
  config: string
): Promise<void> {
  await api.post('/api/preset/', { name, config })
}

export async function updatePreset(
  id: number,
  name: string,
  config: string
): Promise<void> {
  await api.put(`/api/preset/${id}`, { name, config })
}

export async function deletePreset(id: number): Promise<void> {
  await api.delete(`/api/preset/${id}`)
}
