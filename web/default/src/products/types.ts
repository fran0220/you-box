
/** Runtime product id — must match Go product.ID* and PRODUCT_ID env. */
export type ProductId = 'origingame'

/** Capability flags — must match Go product.FeatureSet JSON keys. */
export type FeatureKey =
  | 'agent_desktop'
  | 'model_plaza'
  | 'rankings'
  | 'playground_presets'
  | 'public_marketing'
  | 'subscriptions'

export type FeatureSet = Record<FeatureKey, boolean>

/**
 * UI shell flags (frontend-only). Prefer profile.ui over productId conditionals
 * in components so product identity stays declarative.
 */
export interface ProductUiFlags {
  /** Enable light/dark/system ThemeProvider (Amp × Arcade warm dark). */
  darkMode: boolean
  /** Apply parchment `.paper` marketing canvas. */
  paperMarketing: boolean
  /** Design language id for docs/debug. */
  skin: 'paper'
}

export interface ProductProfile {
  id: ProductId
  displayName: string
  publicBaseUrl: string
  features: FeatureSet
  ui: ProductUiFlags
}

/** Nested `/api/status` → `data.product` payload from the backend. */
export interface ProductStatusPayload {
  id?: string
  display_name?: string
  public_base_url?: string
  features?: Partial<Record<FeatureKey, boolean>>
}
