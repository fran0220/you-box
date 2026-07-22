import { DEFAULT_PRODUCT_ID, FULL_FEATURES, PRODUCT_DEFAULTS } from './defaults'
import type {
  FeatureKey,
  FeatureSet,
  ProductId,
  ProductProfile,
  ProductStatusPayload,
} from './types'

const KNOWN_IDS = new Set<ProductId>(['origingame'])

export function isProductId(value: unknown): value is ProductId {
  return typeof value === 'string' && KNOWN_IDS.has(value as ProductId)
}

function cloneProfile(base: ProductProfile): ProductProfile {
  return {
    ...base,
    features: { ...base.features },
    ui: { ...base.ui },
  }
}

/** Resolve a product profile from id, falling back to Origin Gateway. */
export function resolveProduct(id?: string | null): ProductProfile {
  if (isProductId(id)) {
    return cloneProfile(PRODUCT_DEFAULTS[id])
  }
  return cloneProfile(PRODUCT_DEFAULTS[DEFAULT_PRODUCT_ID])
}

function mergeFeatures(
  base: FeatureSet,
  partial?: Partial<Record<FeatureKey, boolean>>
): FeatureSet {
  if (!partial) return { ...base }
  const next = { ...base }
  for (const key of Object.keys(FULL_FEATURES) as FeatureKey[]) {
    if (typeof partial[key] === 'boolean') {
      next[key] = partial[key]!
    }
  }
  return next
}

/**
 * Merge server `/api/status` product payload over local defaults.
 * Server features are source of truth when present.
 */
export function profileFromStatus(
  payload: ProductStatusPayload | null | undefined
): ProductProfile {
  const resolved = resolveProduct(payload?.id)
  if (!payload) return resolved

  return {
    id: resolved.id,
    displayName:
      typeof payload.display_name === 'string' && payload.display_name.trim()
        ? payload.display_name.trim()
        : resolved.displayName,
    publicBaseUrl:
      typeof payload.public_base_url === 'string' &&
      payload.public_base_url.trim()
        ? payload.public_base_url.trim().replace(/\/$/, '')
        : resolved.publicBaseUrl,
    features: mergeFeatures(resolved.features, payload.features),
    // UI shell flags stay client-declared per product id (not status-driven yet).
    ui: { ...resolved.ui },
  }
}

/** Set `data-product` on <html> so product token CSS can target the skin. */
export function applyProductToDom(id: ProductId): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-product', id)
}
