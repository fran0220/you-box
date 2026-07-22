import { DEFAULT_CONFIG, DEFAULT_PARAMETER_ENABLED, STORAGE_KEYS } from '../constants'
import type { PlaygroundConfig, ParameterEnabled, Message } from '../types'
import { sanitizeMessagesOnLoad } from './message-utils'

function readJson<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key)
    if (!saved) return null
    return JSON.parse(saved) as T
  } catch {
    return null
  }
}

/**
 * Load playground config from localStorage (v2, with legacy migration).
 */
export function loadConfig(): Partial<PlaygroundConfig> {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEYS.CONFIG) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_CONFIG)
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<PlaygroundConfig>
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        tools: parsed.tools ?? DEFAULT_CONFIG.tools,
        toolChoice: parsed.toolChoice ?? DEFAULT_CONFIG.toolChoice,
        responseFormat: parsed.responseFormat ?? DEFAULT_CONFIG.responseFormat,
        compareModels: parsed.compareModels ?? [],
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load config:', error)
  }
  return {}
}

export function saveConfig(config: Partial<PlaygroundConfig>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save config:', error)
  }
}

export function loadParameterEnabled(): Partial<ParameterEnabled> {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEYS.PARAMETER_ENABLED) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_PARAMETER_ENABLED)
    if (saved) {
      return {
        ...DEFAULT_PARAMETER_ENABLED,
        ...(JSON.parse(saved) as Partial<ParameterEnabled>),
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load parameter enabled:', error)
  }
  return {}
}

export function saveParameterEnabled(
  parameterEnabled: Partial<ParameterEnabled>
): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.PARAMETER_ENABLED,
      JSON.stringify(parameterEnabled)
    )
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save parameter enabled:', error)
  }
}

export function loadMessages(): Message[] | null {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEYS.MESSAGES) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_MESSAGES)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (!Array.isArray(parsed)) {
        return null
      }
      const sanitized = sanitizeMessagesOnLoad(parsed as Message[])
      saveMessages(sanitized)
      return sanitized
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to load messages:', error)
  }
  return null
}

export function saveMessages(messages: Message[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to save messages:', error)
  }
}

export function loadActiveConversationId(): number | null {
  const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID)
  if (!raw) return null
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) ? n : null
}

export function saveActiveConversationId(id: number | null): void {
  try {
    if (id == null) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID)
    } else {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID, String(id))
    }
  } catch {
    // ignore
  }
}

export function clearPlaygroundData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONFIG)
    localStorage.removeItem(STORAGE_KEYS.PARAMETER_ENABLED)
    localStorage.removeItem(STORAGE_KEYS.MESSAGES)
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID)
    localStorage.removeItem(STORAGE_KEYS.LEGACY_CONFIG)
    localStorage.removeItem(STORAGE_KEYS.LEGACY_PARAMETER_ENABLED)
    localStorage.removeItem(STORAGE_KEYS.LEGACY_MESSAGES)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to clear playground data:', error)
  }
}

// silence unused import if tree-shaken oddly
void readJson
