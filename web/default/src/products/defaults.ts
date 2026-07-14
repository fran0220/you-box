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
import type { FeatureSet, ProductId, ProductProfile } from './types'

/** Default feature gates (both products; diverge via FeatureSet later). */
export const FULL_FEATURES: FeatureSet = {
  agent_desktop: true,
  model_plaza: true,
  rankings: true,
  playground_presets: true,
  public_marketing: true,
  subscriptions: true,
}

export const PRODUCT_DEFAULTS: Record<ProductId, ProductProfile> = {
  youbox: {
    id: 'youbox',
    displayName: 'YouBox',
    publicBaseUrl: 'https://you-box.com',
    features: { ...FULL_FEATURES },
    ui: {
      darkMode: true,
      paperMarketing: false,
      skin: 'circuit',
    },
  },
  origingame: {
    id: 'origingame',
    displayName: 'Origin Gateway',
    publicBaseUrl: 'https://api.origingame.dev',
    features: { ...FULL_FEATURES },
    ui: {
      darkMode: false,
      paperMarketing: true,
      skin: 'paper',
    },
  },
}

export const DEFAULT_PRODUCT_ID: ProductId = 'youbox'
