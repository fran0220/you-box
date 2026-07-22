import { z } from 'zod'
import type { TFunction } from 'i18next'
import { parseQuotaFromDollars, quotaUnitsToDollars } from '@/lib/format'
import { DEFAULT_GROUP } from '../constants'
import { type ApiKeyFormData, type ApiKey } from '../types'

// ============================================================================
// Form Schema
// ============================================================================

export function getApiKeyFormSchema(t: TFunction) {
  return z
    .object({
      name: z.string().min(1, t('Please enter a name')),
      remain_quota_dollars: z.number().optional(),
      expired_time: z.date().optional(),
      unlimited_quota: z.boolean(),
      model_limits: z.array(z.string()),
      allow_ips: z.string().optional(),
      group: z.string().optional(),
      cross_group_retry: z.boolean().optional(),
      // When set to a recurring period, the credit limit auto-refills each
      // period (OpenRouter-style). 'none' disables it.
      reset_period: z.enum(['none', 'daily', 'weekly', 'monthly']).optional(),
      tokenCount: z.number().min(1).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.unlimited_quota) {
        return
      }

      if (
        data.remain_quota_dollars === undefined ||
        data.remain_quota_dollars < 0
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['remain_quota_dollars'],
          message: t('Quota must be zero or greater'),
        })
      }
    })
}

export type ApiKeyFormValues = z.infer<ReturnType<typeof getApiKeyFormSchema>>

// ============================================================================
// Form Defaults
// ============================================================================

export const API_KEY_FORM_DEFAULT_VALUES: ApiKeyFormValues = {
  name: '',
  remain_quota_dollars: 10,
  expired_time: undefined,
  unlimited_quota: true,
  model_limits: [],
  allow_ips: '',
  group: DEFAULT_GROUP,
  cross_group_retry: true,
  reset_period: 'none',
  tokenCount: 1,
}

export function getApiKeyFormDefaultValues(
  defaultUseAutoGroup: boolean
): ApiKeyFormValues {
  return {
    ...API_KEY_FORM_DEFAULT_VALUES,
    group: defaultUseAutoGroup ? 'auto' : DEFAULT_GROUP,
    cross_group_retry: defaultUseAutoGroup,
  }
}

// ============================================================================
// Form Data Transformation
// ============================================================================

/**
 * Transform form data to API payload
 */
export function transformFormDataToPayload(
  data: ApiKeyFormValues,
  original?: ApiKey
): ApiKeyFormData {
  const remainQuota = data.unlimited_quota
    ? 0
    : parseQuotaFromDollars(data.remain_quota_dollars || 0)

  // The recurring spend limit reuses the credit-limit value: when a reset
  // period is chosen (and the key is not unlimited), the budget auto-refills
  // to that amount each period.
  const recurring =
    !data.unlimited_quota &&
    data.reset_period != null &&
    data.reset_period !== 'none' &&
    remainQuota > 0

  // When editing an already-recurring key, the credit field reflects the
  // per-period budget (spend_limit), not the live remaining quota. If the
  // budget amount is unchanged, preserve the live remaining quota so an
  // unrelated edit (rename, IP list, group, …) doesn't refund the quota
  // already spent this period.
  let remainToSend = remainQuota
  if (
    original &&
    recurring &&
    (original.reset_period ?? 'none') !== 'none' &&
    (original.spend_limit ?? 0) > 0 &&
    remainQuota === (original.spend_limit ?? 0)
  ) {
    remainToSend = original.remain_quota
  }

  return {
    name: data.name,
    remain_quota: remainToSend,
    expired_time: data.expired_time
      ? Math.floor(data.expired_time.getTime() / 1000)
      : -1,
    unlimited_quota: data.unlimited_quota,
    model_limits_enabled: data.model_limits.length > 0,
    model_limits: data.model_limits.join(','),
    allow_ips: data.allow_ips || '',
    group: data.group || '',
    cross_group_retry: data.group === 'auto' ? !!data.cross_group_retry : false,
    spend_limit: recurring ? remainQuota : 0,
    reset_period: recurring ? data.reset_period! : 'none',
    // Let the backend scheduler initialize the next reset time.
    next_reset_time: 0,
  }
}

/**
 * Transform API key data to form defaults
 */
export function transformApiKeyToFormDefaults(
  apiKey: ApiKey
): ApiKeyFormValues {
  const resetPeriod = apiKey.reset_period || 'none'
  const recurring = resetPeriod !== 'none' && (apiKey.spend_limit ?? 0) > 0
  // For a recurring key the credit-limit field reflects the spend budget, not
  // the (possibly partially-spent) current remaining quota.
  const creditDollars = apiKey.unlimited_quota
    ? 0
    : quotaUnitsToDollars(
        recurring ? (apiKey.spend_limit ?? 0) : apiKey.remain_quota
      )

  return {
    name: apiKey.name,
    remain_quota_dollars: creditDollars,
    expired_time:
      apiKey.expired_time > 0
        ? new Date(apiKey.expired_time * 1000)
        : undefined,
    unlimited_quota: apiKey.unlimited_quota,
    model_limits: apiKey.model_limits
      ? apiKey.model_limits.split(',').filter(Boolean)
      : [],
    allow_ips: apiKey.allow_ips || '',
    group: apiKey.group || DEFAULT_GROUP,
    cross_group_retry: !!apiKey.cross_group_retry,
    reset_period: recurring
      ? (resetPeriod as 'daily' | 'weekly' | 'monthly')
      : 'none',
    tokenCount: 1,
  }
}
