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
import { profileFromStatus, resolveProduct } from './registry'

describe('resolveProduct', () => {
  it('defaults to youbox', () => {
    expect(resolveProduct().id).toBe('youbox')
    expect(resolveProduct('unknown').id).toBe('youbox')
  })

  it('resolves origingame Paper UI flags', () => {
    const p = resolveProduct('origingame')
    expect(p.id).toBe('origingame')
    expect(p.publicBaseUrl).toBe('https://api.origingame.dev')
    expect(p.ui.darkMode).toBe(false)
    expect(p.ui.paperMarketing).toBe(true)
    expect(p.ui.skin).toBe('paper')
  })

  it('resolves youbox Circuit UI flags', () => {
    const p = resolveProduct('youbox')
    expect(p.ui.darkMode).toBe(true)
    expect(p.ui.paperMarketing).toBe(false)
    expect(p.ui.skin).toBe('circuit')
  })
})

describe('profileFromStatus', () => {
  it('merges server features over defaults', () => {
    const p = profileFromStatus({
      id: 'origingame',
      display_name: 'OG',
      public_base_url: 'https://api.origingame.dev/',
      features: { agent_desktop: false },
    })
    expect(p.id).toBe('origingame')
    expect(p.displayName).toBe('OG')
    expect(p.publicBaseUrl).toBe('https://api.origingame.dev')
    expect(p.features.agent_desktop).toBe(false)
    expect(p.features.model_plaza).toBe(true)
  })
})
