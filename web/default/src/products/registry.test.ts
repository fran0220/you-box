import { describe, expect, it } from 'vitest'
import { profileFromStatus, resolveProduct } from './registry'

describe('resolveProduct', () => {
  it('defaults to origingame (Origin Gateway)', () => {
    expect(resolveProduct().id).toBe('origingame')
    expect(resolveProduct('unknown').id).toBe('origingame')
  })

  it('resolves origingame Paper UI flags and gateway features', () => {
    const p = resolveProduct('origingame')
    expect(p.id).toBe('origingame')
    expect(p.publicBaseUrl).toBe('https://api.origingame.dev')
    expect(p.ui.darkMode).toBe(true)
    expect(p.ui.paperMarketing).toBe(true)
    expect(p.ui.skin).toBe('paper')
    expect(p.features.agent_desktop).toBe(false)
    expect(p.features.subscriptions).toBe(true)
    expect(p.features.rankings).toBe(false)
  })

  it('falls back to origingame for retired/unknown product ids', () => {
    expect(resolveProduct('youbox').id).toBe('origingame')
    expect(resolveProduct(null).id).toBe('origingame')
  })
})

describe('profileFromStatus', () => {
  it('merges server features over defaults', () => {
    const p = profileFromStatus({
      id: 'origingame',
      display_name: 'OG',
      public_base_url: 'https://api.origingame.dev/',
      features: { agent_desktop: true },
    })
    expect(p.id).toBe('origingame')
    expect(p.displayName).toBe('OG')
    expect(p.publicBaseUrl).toBe('https://api.origingame.dev')
    expect(p.features.agent_desktop).toBe(true)
    // Server did not send model_plaza — keep origingame default (false)
    expect(p.features.model_plaza).toBe(false)
    expect(p.features.subscriptions).toBe(true)
  })
})
