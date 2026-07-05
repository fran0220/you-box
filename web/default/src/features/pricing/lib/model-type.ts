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
import { ENDPOINT_TYPES } from '../constants'
import type { PricingModel, PricingVendor } from '../types'
import type { FacetOption } from './filters'

/** Canonical model-type facet values (English labels; i18n at UI layer). */
export const MODEL_TYPE_VALUES = {
  IMAGE: 'Image',
  EMBEDDING: 'Embedding',
  RERANK: 'Rerank',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  MODEL_3D: '3D',
  CHAT: 'Chat',
} as const

export type ModelTypeValue =
  (typeof MODEL_TYPE_VALUES)[keyof typeof MODEL_TYPE_VALUES]

const CHAT_ENDPOINT_TYPES = new Set<string>([
  ENDPOINT_TYPES.OPENAI,
  ENDPOINT_TYPES.OPENAI_RESPONSE,
  ENDPOINT_TYPES.ANTHROPIC,
  ENDPOINT_TYPES.GEMINI,
])

const AUDIO_ENDPOINT_TYPES = new Set<string>([
  ENDPOINT_TYPES.AUDIO,
  ENDPOINT_TYPES.AUDIO_TTS,
  ENDPOINT_TYPES.AUDIO_STT,
  ENDPOINT_TYPES.AUDIO_SPEECH_TO_SPEECH,
  ENDPOINT_TYPES.AUDIO_SFX,
  ENDPOINT_TYPES.AUDIO_MUSIC,
  ENDPOINT_TYPES.AUDIO_ISOLATION,
  ENDPOINT_TYPES.AUDIO_ALIGNMENT,
])

const MODEL_3D_ENDPOINT_TYPES = new Set<string>([
  ENDPOINT_TYPES.MODEL_3D,
  ENDPOINT_TYPES.MODEL_3D_TEXT,
  ENDPOINT_TYPES.MODEL_3D_IMAGE,
  ENDPOINT_TYPES.MODEL_3D_MULTI_IMAGE,
  ENDPOINT_TYPES.MODEL_3D_POST_PROCESS,
  ENDPOINT_TYPES.MODEL_3D_ANIMATION,
  ENDPOINT_TYPES.MODEL_3D_REMESH,
  ENDPOINT_TYPES.MODEL_3D_CONVERT,
  ENDPOINT_TYPES.MODEL_3D_RESIZE,
  ENDPOINT_TYPES.MODEL_3D_RETEXTURE,
  ENDPOINT_TYPES.MODEL_3D_RIGGING,
  ENDPOINT_TYPES.MODEL_3D_CHARACTER_ANIMATION,
])

/**
 * Deterministic ordering when a model maps to multiple types (specialty types
 * before Chat). Membership is independent: each rule below may add a type.
 *
 * Precedence (documentation only; all matching rules apply):
 * 1. `image-generation` -> Image
 * 2. `embeddings` -> Embedding
 * 3. `jina-rerank` -> Rerank
 * 4. `openai-video` -> Video
 * 5. `audio*` endpoint, `audio_ratio`, or `audio_completion_ratio` > 0 -> Audio
 * 6. `model-3d*` endpoint -> 3D
 * 7. Any of openai / openai-response / anthropic / gemini in
 *    `supported_endpoint_types` -> Chat
 */
const MODEL_TYPE_DISPLAY_ORDER: ModelTypeValue[] = [
  MODEL_TYPE_VALUES.IMAGE,
  MODEL_TYPE_VALUES.EMBEDDING,
  MODEL_TYPE_VALUES.RERANK,
  MODEL_TYPE_VALUES.VIDEO,
  MODEL_TYPE_VALUES.AUDIO,
  MODEL_TYPE_VALUES.MODEL_3D,
  MODEL_TYPE_VALUES.CHAT,
]

function hasPositiveAudioRatio(model: PricingModel): boolean {
  const input = model.audio_ratio
  const output = model.audio_completion_ratio
  return (
    (typeof input === 'number' && input > 0) ||
    (typeof output === 'number' && output > 0)
  )
}

/**
 * Derive one or more model types from real `/api/pricing` fields only.
 */
export function deriveModelTypes(model: PricingModel): ModelTypeValue[] {
  const endpoints = model.supported_endpoint_types ?? []
  const endpointSet = new Set(endpoints)
  const matched = new Set<ModelTypeValue>()

  if (endpointSet.has(ENDPOINT_TYPES.IMAGE_GENERATION)) {
    matched.add(MODEL_TYPE_VALUES.IMAGE)
  }
  if (endpointSet.has(ENDPOINT_TYPES.EMBEDDINGS)) {
    matched.add(MODEL_TYPE_VALUES.EMBEDDING)
  }
  if (endpointSet.has(ENDPOINT_TYPES.JINA_RERANK)) {
    matched.add(MODEL_TYPE_VALUES.RERANK)
  }
  if (endpointSet.has(ENDPOINT_TYPES.OPENAI_VIDEO)) {
    matched.add(MODEL_TYPE_VALUES.VIDEO)
  }
  if (
    endpoints.some((e) => AUDIO_ENDPOINT_TYPES.has(e)) ||
    hasPositiveAudioRatio(model)
  ) {
    matched.add(MODEL_TYPE_VALUES.AUDIO)
  }
  if (endpoints.some((e) => MODEL_3D_ENDPOINT_TYPES.has(e))) {
    matched.add(MODEL_TYPE_VALUES.MODEL_3D)
  }
  if (endpoints.some((e) => CHAT_ENDPOINT_TYPES.has(e))) {
    matched.add(MODEL_TYPE_VALUES.CHAT)
  }

  return MODEL_TYPE_DISPLAY_ORDER.filter((t) => matched.has(t))
}

/**
 * Vendor facet options from `vendor_id` joined to the vendors catalog.
 * Models with missing or unknown `vendor_id` are excluded from counts.
 */
export function extractVendors(
  models: PricingModel[],
  vendors: PricingVendor[]
): FacetOption[] {
  const nameById = new Map(vendors.map((v) => [v.id, v.name]))
  const counts = new Map<string, number>()

  for (const m of models) {
    const id = m.vendor_id
    if (id == null) continue
    const name = nameById.get(id)
    if (!name) continue
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

/** Model-type facet options with per-type model counts (multi-type models count in each). */
export function extractModelTypeFacets(models: PricingModel[]): FacetOption[] {
  const counts = new Map<ModelTypeValue, number>()

  for (const m of models) {
    for (const t of deriveModelTypes(m)) {
      counts.set(t, (counts.get(t) ?? 0) + 1)
    }
  }

  return MODEL_TYPE_DISPLAY_ORDER.filter((t) => counts.has(t)).map((value) => ({
    value,
    label: value,
    count: counts.get(value) ?? 0,
  }))
}
