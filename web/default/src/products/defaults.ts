import type { FeatureSet, ProductId, ProductProfile } from './types'

/**
 * Full capability surface (all feature keys on). Used as the merge base when
 * reconciling server `/api/status` features and as the canonical key list.
 */
export const FULL_FEATURES: FeatureSet = {
  agent_desktop: true,
  model_plaza: true,
  rankings: true,
  playground_presets: true,
  public_marketing: true,
  subscriptions: true,
}

/** Production Origin Gateway feature surface (matches Go originGatewayFeatures). */
export const ORIGIN_GATEWAY_FEATURES: FeatureSet = {
  agent_desktop: false,
  model_plaza: false,
  rankings: false,
  playground_presets: false,
  public_marketing: false,
  subscriptions: true,
}

export const PRODUCT_DEFAULTS: Record<ProductId, ProductProfile> = {
  origingame: {
    id: 'origingame',
    displayName: 'Origin Gateway',
    publicBaseUrl: 'https://api.origingame.dev',
    features: { ...ORIGIN_GATEWAY_FEATURES },
    ui: {
      darkMode: true,
      paperMarketing: true,
      skin: 'paper',
    },
  },
}

/** Default product when status is missing — production Origin Gateway. */
export const DEFAULT_PRODUCT_ID: ProductId = 'origingame'
