import type { AffinityRule, ChannelAffinitySettings } from './types'

export type ChannelAffinityEditMode = 'visual' | 'json'

export type ChannelAffinityFormValues = {
  enabled: boolean
  switchOnSuccess: boolean
  keepOnChannelDisabled: boolean
  maxEntries: number
  defaultTtl: number
  rules: AffinityRule[]
  editMode: ChannelAffinityEditMode
  rulesJson: string
}

/** Slice passed from the section UI into flatten/compare helpers. */
export type ChannelAffinityEditorSlice = ChannelAffinityFormValues

export function parseRules(jsonStr: string): AffinityRule[] {
  try {
    const arr = JSON.parse(jsonStr || '[]')
    if (!Array.isArray(arr)) return []
    return arr.map(
      (r: Record<string, unknown>, i: number) =>
        ({ id: i, ...r }) as AffinityRule
    )
  } catch {
    return []
  }
}

export function serializeRules(rules: AffinityRule[]): string {
  return JSON.stringify(rules.map(({ id: _, ...rest }) => rest))
}

export function rulesToJsonText(rules: AffinityRule[]): string {
  return JSON.stringify(
    rules.map(({ id: _, ...r }) => r),
    null,
    2
  )
}

export function buildChannelAffinityFormDefaults(
  settings: ChannelAffinitySettings
): ChannelAffinityFormValues {
  const rules = parseRules(settings['channel_affinity_setting.rules'])
  return {
    enabled: settings['channel_affinity_setting.enabled'],
    switchOnSuccess: settings['channel_affinity_setting.switch_on_success'],
    keepOnChannelDisabled:
      settings['channel_affinity_setting.keep_on_channel_disabled'],
    maxEntries: settings['channel_affinity_setting.max_entries'],
    defaultTtl: settings['channel_affinity_setting.default_ttl_seconds'],
    rules,
    editMode: 'visual',
    rulesJson: rulesToJsonText(rules),
  }
}

export function normalizeRulesJsonFromSettings(rulesStr: string): string {
  try {
    return JSON.stringify(JSON.parse(rulesStr || '[]'))
  } catch {
    return '[]'
  }
}

export function flattenChannelAffinityForSave(
  values: ChannelAffinityEditorSlice
): Record<string, string | number | boolean> {
  let rulesJson: string
  if (values.editMode === 'json') {
    const parsed = JSON.parse(values.rulesJson)
    if (!Array.isArray(parsed)) {
      throw new Error('Rules JSON must be an array')
    }
    rulesJson = JSON.stringify(parsed)
  } else {
    rulesJson = serializeRules(values.rules)
  }

  return {
    'channel_affinity_setting.enabled': values.enabled,
    'channel_affinity_setting.switch_on_success': values.switchOnSuccess,
    'channel_affinity_setting.keep_on_channel_disabled':
      values.keepOnChannelDisabled,
    'channel_affinity_setting.max_entries': values.maxEntries,
    'channel_affinity_setting.default_ttl_seconds': values.defaultTtl,
    'channel_affinity_setting.rules': rulesJson,
  }
}

export function compareChannelAffinityBaselines(
  flattened: Record<string, string | number | boolean>,
  settings: ChannelAffinitySettings
): Record<string, string | number | boolean> {
  const origRules = normalizeRulesJsonFromSettings(
    settings['channel_affinity_setting.rules']
  )
  const nextRules = String(flattened['channel_affinity_setting.rules'])

  const changed: Record<string, string | number | boolean> = {}

  if (flattened['channel_affinity_setting.enabled'] !== settings['channel_affinity_setting.enabled']) {
    changed['channel_affinity_setting.enabled'] =
      flattened['channel_affinity_setting.enabled']
  }
  if (
    flattened['channel_affinity_setting.switch_on_success'] !==
    settings['channel_affinity_setting.switch_on_success']
  ) {
    changed['channel_affinity_setting.switch_on_success'] =
      flattened['channel_affinity_setting.switch_on_success']
  }
  if (
    flattened['channel_affinity_setting.keep_on_channel_disabled'] !==
    settings['channel_affinity_setting.keep_on_channel_disabled']
  ) {
    changed['channel_affinity_setting.keep_on_channel_disabled'] =
      flattened['channel_affinity_setting.keep_on_channel_disabled']
  }
  if (
    flattened['channel_affinity_setting.max_entries'] !==
    settings['channel_affinity_setting.max_entries']
  ) {
    changed['channel_affinity_setting.max_entries'] =
      flattened['channel_affinity_setting.max_entries']
  }
  if (
    flattened['channel_affinity_setting.default_ttl_seconds'] !==
    settings['channel_affinity_setting.default_ttl_seconds']
  ) {
    changed['channel_affinity_setting.default_ttl_seconds'] =
      flattened['channel_affinity_setting.default_ttl_seconds']
  }
  if (nextRules !== origRules) {
    changed['channel_affinity_setting.rules'] = nextRules
  }

  return changed
}
