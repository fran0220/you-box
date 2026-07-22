import { useProductStore } from './store'
import type { FeatureKey } from './types'

/** Active product profile (id, branding defaults, features). */
export function useProduct() {
  return useProductStore((s) => s.profile)
}

/** Whether the active product enables a capability. */
export function useFeature(key: FeatureKey): boolean {
  return useProductStore((s) => s.profile.features[key] === true)
}
