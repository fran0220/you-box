import {
  deriveModelTypes,
  MODEL_TYPE_VALUES,
} from '@/features/pricing/lib/model-type'
import type { PricingModel } from '@/features/pricing/types'
import type { ModelPricing } from './cost'
import type { GroupOption, ModelOption } from '../types'

/** Name patterns that indicate non-chat specialty models (fallback only). */
const SPECIALTY_NAME_RE =
  /(tts|whisper|transcribe|speech|audio|eleven_|scribe|embedding|embed-|rerank|dall-e|flux|stable-diffusion|midjourney|sora|veo|suno|udio|music|sfx|sound-effect)/i

/** Name patterns that indicate reasoning-capable models. */
const REASONING_NAME_RE =
  /(^|[/:])o[1-4]([.-]|$)|gpt-5|deepseek-r|qwq|reasoning|thinking|glm-z|grok-[34]|gemini-2\.5|claude-.*(?:thinking|4)/i

const REASONING_TAG_RE = /reasoning|thinking/i

function toPricingModel(name: string, row: ModelPricing): PricingModel {
  return {
    id: 0,
    model_name: name,
    quota_type: row.quotaType,
    model_ratio: row.modelRatio,
    completion_ratio: row.completionRatio,
    model_price: row.modelPrice,
    cache_ratio: row.cacheRatio,
    audio_ratio: row.audioRatio,
    audio_completion_ratio: row.audioCompletionRatio,
    enable_groups: row.enableGroups ?? [],
    tags: row.tags,
    supported_endpoint_types: row.supportedEndpointTypes,
  }
}

/**
 * Whether a model should appear in the product Chat model list.
 * Prefer pricing endpoint evidence via `deriveModelTypes`; fall back to a
 * specialty-name filter when no pricing row (or endpoints) is available.
 */
export function isChatModel(
  name: string,
  row?: ModelPricing | null
): boolean {
  if (row?.supportedEndpointTypes && row.supportedEndpointTypes.length > 0) {
    const types = deriveModelTypes(toPricingModel(name, row))
    return types.includes(MODEL_TYPE_VALUES.CHAT)
  }
  return !SPECIALTY_NAME_RE.test(name)
}

/**
 * Whether the product chrome should show a reasoning-intensity control.
 * Tags win when present; otherwise use the expanded name heuristic.
 */
export function supportsReasoning(
  name: string,
  row?: ModelPricing | null
): boolean {
  if (row?.tags && REASONING_TAG_RE.test(row.tags)) return true
  return REASONING_NAME_RE.test(name)
}

export function filterChatModels(
  models: ModelOption[],
  pricingMap: Record<string, ModelPricing> | undefined
): ModelOption[] {
  return models.filter((m) => isChatModel(m.value, pricingMap?.[m.value]))
}

/**
 * Pick a group that is valid for both the user and the model's enable list.
 * Prefer keeping the current group when still valid.
 */
export function pickGroupForModel(
  current: string,
  enableGroups: string[] | undefined,
  userGroups: GroupOption[]
): string {
  const userValues = userGroups.map((g) => g.value)
  if (userValues.length === 0) return current || 'default'

  let candidates = userValues
  if (enableGroups && enableGroups.length > 0) {
    const allowed = new Set(enableGroups)
    const intersection = userValues.filter((g) => allowed.has(g))
    if (intersection.length > 0) {
      candidates = intersection
    }
  }

  if (current && candidates.includes(current)) return current
  if (candidates.includes('default')) return 'default'

  // Prefer the lowest ratio (cheapest) among remaining options.
  const ranked = [...candidates].sort((a, b) => {
    const ra = userGroups.find((g) => g.value === a)?.ratio ?? 1
    const rb = userGroups.find((g) => g.value === b)?.ratio ?? 1
    return ra - rb
  })
  return ranked[0] ?? (current || 'default')
}
