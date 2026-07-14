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

/** Runtime product id — must match Go product.ID* and PRODUCT_ID env. */
export type ProductId = 'youbox' | 'origingame'

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
  /** Enable light/dark/system ThemeProvider (youbox Circuit). */
  darkMode: boolean
  /** Apply cream `.paper` marketing canvas (origingame Paper). */
  paperMarketing: boolean
  /** Design language id for docs/debug. */
  skin: 'circuit' | 'paper'
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
