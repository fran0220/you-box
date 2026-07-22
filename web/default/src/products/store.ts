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
