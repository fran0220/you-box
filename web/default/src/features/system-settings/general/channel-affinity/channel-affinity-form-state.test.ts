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
import { describe, expect, it } from 'vitest'
import { normalizeJsonString } from '../../models/utils'
import {
  buildChannelAffinityFormDefaults,
  compareChannelAffinityBaselines as compareAffinity,
  flattenChannelAffinityForSave as flattenAffinity,
} from './channel-affinity-form-state'
import type { ChannelAffinitySettings } from './types'

const baseSettings: ChannelAffinitySettings = {
  'channel_affinity_setting.enabled': false,
  'channel_affinity_setting.switch_on_success': true,
  'channel_affinity_setting.keep_on_channel_disabled': false,
  'channel_affinity_setting.max_entries': 100000,
  'channel_affinity_setting.default_ttl_seconds': 3600,
  'channel_affinity_setting.rules': '[]',
}

describe('channel affinity form state', () => {
  it('detects enabled toggle as dirty', () => {
    const form = buildChannelAffinityFormDefaults(baseSettings)
    const flat = flattenAffinity({ ...form, enabled: true })
    const changed = compareAffinity(flat, baseSettings)
    expect(changed).toEqual({
      'channel_affinity_setting.enabled': true,
    })
  })

  it('serializes visual rules for PUT keys', () => {
    const form = buildChannelAffinityFormDefaults(baseSettings)
    const flat = flattenAffinity({
      ...form,
      rules: [
        {
          id: 0,
          name: 'test-rule',
          model_regex: ['.*'],
          path_regex: [],
          key_sources: [],
          ttl_seconds: 60,
          skip_retry_on_failure: false,
          include_using_group: false,
          include_model_name: false,
          include_rule_name: true,
        },
      ],
    })
    expect(flat['channel_affinity_setting.rules']).toBe(
      JSON.stringify([
        {
          name: 'test-rule',
          model_regex: ['.*'],
          path_regex: [],
          key_sources: [],
          ttl_seconds: 60,
          skip_retry_on_failure: false,
          include_using_group: false,
          include_model_name: false,
          include_rule_name: true,
        },
      ])
    )
  })
})

describe('model JSON normalize for persistence', () => {
  it('normalizes JSON strings for option comparison', () => {
    const raw = '  [ "a" ]  '
    expect(normalizeJsonString(raw)).toBe('["a"]')
  })
})
