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
import { create } from 'zustand'
import { DEFAULT_PRODUCT_ID, PRODUCT_DEFAULTS } from './defaults'
import {
  applyProductToDom,
  profileFromStatus,
  resolveProduct,
} from './registry'
import type {
  FeatureKey,
  ProductProfile,
  ProductStatusPayload,
} from './types'

interface ProductState {
  profile: ProductProfile
  setFromStatus: (payload: ProductStatusPayload | null | undefined) => void
  setProductId: (id: string) => void
  hasFeature: (key: FeatureKey) => boolean
}

export const useProductStore = create<ProductState>((set, get) => ({
  profile: resolveProduct(DEFAULT_PRODUCT_ID),

  setFromStatus: (payload) => {
    const profile = profileFromStatus(payload)
    applyProductToDom(profile.id)
    set({ profile })
  },

  setProductId: (id) => {
    const profile = resolveProduct(id)
    applyProductToDom(profile.id)
    set({ profile })
  },

  hasFeature: (key) => get().profile.features[key] === true,
}))

/** Non-React access for early bootstrap (main.tsx). */
export function getProductProfile(): ProductProfile {
  return useProductStore.getState().profile
}

export function productHasFeature(key: FeatureKey): boolean {
  return useProductStore.getState().hasFeature(key)
}

export function applyProductFromStatusData(
  status: Record<string, unknown> | null | undefined
): void {
  const raw = status?.product
  if (raw && typeof raw === 'object') {
    useProductStore.getState().setFromStatus(raw as ProductStatusPayload)
    return
  }
  // No nested product yet (old backend / cache): keep default skin.
  applyProductToDom(useProductStore.getState().profile.id)
}

// Apply default product attribute ASAP so CSS does not flash wrong skin.
if (typeof document !== 'undefined') {
  applyProductToDom(PRODUCT_DEFAULTS[DEFAULT_PRODUCT_ID].id)
}
