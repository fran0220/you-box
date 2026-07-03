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
import type { ReactNode } from 'react'
import type { Control } from 'react-hook-form'
import type { TFunction } from 'i18next'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ChannelFormValues } from '../../lib'

// ---------------------------------------------------------------------------
// Per-channel-type API-access field registry.
//
// Replaces the ~30 hand-written `currentType === N` branches that used to live
// inline in channel-mutate-drawer.tsx (API Access section). Each channel type
// maps to an ORDERED list of field descriptors that a single uniform renderer
// walks. Behavior — every field, default, placeholder, conditional visibility,
// validation rule and submit payload — is preserved EXACTLY; this is a
// presentation/structure refactor only.
//
// Most provider fields are plain inputs/textareas/selects/switches, so they are
// expressed declaratively. The handful that need component-local state (e.g.
// VolcEngine's secret click-to-unlock dual mode, Vertex's RHF-tracked JSON file
// upload) use the `custom` descriptor and render via a callback supplied by the
// drawer, keeping the per-type escape hatch close to the data that drives it.
// ---------------------------------------------------------------------------

type SimpleTextField = keyof ChannelFormValues

/** A plain `<Input>` bound to a string form field. */
type InputFieldDescriptor = {
  kind: 'input'
  name: SimpleTextField
  /** Already-translated label. */
  label: ReactNode
  /** i18n source key for the placeholder (passed to `t`). */
  placeholderKey?: string
  /** Already-rendered placeholder node (takes precedence over `placeholderKey`). */
  placeholder?: string
  /** Already-rendered description node. */
  description?: ReactNode
}

/** A plain `<Textarea>` bound to a string form field. */
type TextareaFieldDescriptor = {
  kind: 'textarea'
  name: SimpleTextField
  label: ReactNode
  placeholder?: string
  rows?: number
  description?: ReactNode
}

/** A `<Select>` bound to a string form field; description may depend on value. */
type SelectFieldDescriptor = {
  kind: 'select'
  name: SimpleTextField
  label: ReactNode
  placeholder?: string
  options: Array<{ value: string; label: ReactNode }>
  /** Compute the description from the current field value (matches old code). */
  description?: (value: string) => ReactNode
}

/** A `<Switch>` bound to a boolean form field, laid out as a labelled row. */
type SwitchFieldDescriptor = {
  kind: 'switch'
  name: SimpleTextField
  label: ReactNode
  description?: ReactNode
}

/**
 * Escape hatch for provider fields that need component-local state or bespoke
 * markup the declarative descriptors can't express (VolcEngine dual-mode URL,
 * Vertex JSON file upload, SiliconFlow referral alert, etc.). The drawer
 * supplies the renderer; this descriptor only carries a stable React key.
 */
type CustomFieldDescriptor = {
  kind: 'custom'
  key: string
  render: () => ReactNode
}

export type ApiAccessFieldDescriptor =
  | InputFieldDescriptor
  | TextareaFieldDescriptor
  | SelectFieldDescriptor
  | SwitchFieldDescriptor
  | CustomFieldDescriptor

/**
 * Context handed to {@link buildApiAccessFields} so the registry can build
 * descriptors that depend on translations and component-local escape hatches.
 * The escape-hatch renderers are passed through verbatim from the drawer.
 */
export type ApiAccessFieldContext = {
  t: TFunction
  /** SiliconFlow (type 40) referral alert — keeps the inline link markup. */
  renderSiliconFlowAlert: () => ReactNode
  /** VolcEngine (type 45) base_url dual-mode (locked select / unlocked input). */
  renderVolcEngineBaseUrl: () => ReactNode
  /** Vertex AI (type 41) service-account JSON file upload (RHF-tracked). */
  renderVertexJsonFileUpload: () => ReactNode
}

/**
 * Build the ordered API-access field descriptors for a channel type.
 *
 * Returns `null` when the type has no provider-specific descriptors AND should
 * fall back to the generic Base URL field (handled by the caller). Returns an
 * array (possibly empty markers via `custom`) otherwise. The generic Base URL
 * field is appended by the caller for every type EXCEPT [3, 8, 22, 36, 45],
 * exactly matching the previous `![3, 8, 22, 36, 45].includes(currentType)`
 * gate.
 */
export function buildApiAccessFields(
  type: number,
  ctx: ApiAccessFieldContext
): ApiAccessFieldDescriptor[] {
  const { t } = ctx

  switch (type) {
    // Azure (type 3)
    case 3:
      return [
        {
          kind: 'input',
          name: 'base_url',
          label: t('AZURE_OPENAI_ENDPOINT *'),
          placeholder: t('e.g., https://docs-test-001.openai.azure.com'),
          description: t('Your Azure OpenAI endpoint URL'),
        },
        {
          kind: 'input',
          name: 'other',
          label: t('Default API Version *'),
          placeholder: t('e.g., 2025-04-01-preview'),
          description: t('Default API version for this channel'),
        },
        {
          kind: 'input',
          name: 'azure_responses_version',
          label: t('Responses API Version'),
          placeholder: t('e.g., preview'),
          description: t(
            'Default Responses API version, if empty, will use the API version above'
          ),
        },
      ]

    // Custom (type 8)
    case 8:
      return [
        {
          kind: 'input',
          name: 'base_url',
          label: (
            <>
              {t('Full Base URL (supports')} {'{'}
              {t('model')}
              {'}'} {t('variable) *')}
            </>
          ),
          placeholder: t('e.g., https://api.openai.com/v1/chat/completions'),
          description: (
            <>
              {t('Enter the complete URL, supports')} {'{'}
              {t('model')}
              {'}'} {t('variable')}
            </>
          ),
        },
      ]

    // Xunfei/Spark (type 18)
    case 18:
      return [
        {
          kind: 'input',
          name: 'other',
          label: t('Model Version *'),
          placeholder: t('e.g., v2.1'),
          description: t(
            'Spark model version, e.g., v2.1 (version number in API URL)'
          ),
        },
      ]

    // OpenRouter (type 20)
    case 20:
      return [
        {
          kind: 'switch',
          name: 'is_enterprise_account',
          label: t('Enterprise Account'),
          description: t(
            'Enable if this is an OpenRouter enterprise account with special response format'
          ),
        },
      ]

    // AI Proxy Library (type 21)
    case 21:
      return [
        {
          kind: 'input',
          name: 'other',
          label: t('Knowledge Base ID *'),
          placeholder: t('e.g., 123456'),
          description: t('Enter the knowledge base ID'),
        },
      ]

    // FastGPT (type 22)
    case 22:
      return [
        {
          kind: 'input',
          name: 'base_url',
          label: t('Private Deployment URL'),
          placeholder: t('e.g., https://fastgpt.run/api/openapi'),
          description: t(
            'For private deployments, format: https://fastgpt.run/api/openapi'
          ),
        },
      ]

    // AWS (type 33)
    case 33:
      return [
        {
          kind: 'select',
          name: 'aws_key_type',
          label: t('AWS Key Format'),
          placeholder: t('Select key format'),
          options: [
            { value: 'ak_sk', label: t('AccessKey / SecretAccessKey') },
            { value: 'api_key', label: t('API Key') },
          ],
          description: (value) =>
            value === 'api_key'
              ? t('API Key mode: use APIKey|Region')
              : t('AK/SK mode: use AccessKey|SecretAccessKey|Region'),
        },
      ]

    // SunoAPI (type 36)
    case 36:
      return [
        {
          kind: 'input',
          name: 'base_url',
          label: t('API Base URL (Important: Not Chat API) *'),
          placeholder: t('e.g., https://api.example.com (path before /suno)'),
          description: t(
            'Enter the path before /suno, usually just the domain'
          ),
        },
      ]

    // Cloudflare Workers AI (type 39)
    case 39:
      return [
        {
          kind: 'input',
          name: 'other',
          label: t('Account ID *'),
          placeholder: t('e.g., d6b5da8hk1awo8nap34ube6gh'),
          description: t('Your Cloudflare Account ID'),
        },
      ]

    // SiliconFlow (type 40)
    case 40:
      return [
        {
          kind: 'custom',
          key: 'siliconflow-alert',
          render: ctx.renderSiliconFlowAlert,
        },
      ]

    // Vertex AI (type 41)
    case 41:
      return [
        {
          kind: 'select',
          name: 'vertex_key_type',
          label: t('Vertex AI Key Format'),
          options: [
            { value: 'json', label: t('JSON') },
            { value: 'api_key', label: t('API Key') },
          ],
          description: (value) =>
            value === 'json'
              ? t('JSON format supports service account JSON files')
              : t('API Key mode (does not support batch creation)'),
        },
        {
          kind: 'custom',
          key: 'vertex-json-file',
          render: ctx.renderVertexJsonFileUpload,
        },
        {
          kind: 'textarea',
          name: 'other',
          label: t('Deployment Region *'),
          placeholder: t(
            'e.g., us-central1 or JSON format for model-specific regions'
          ),
          rows: 3,
          description: (
            <>
              {t('Enter deployment region or JSON mapping:')} {'{'}
              {t(
                '"default": "us-central1", "claude-3-5-sonnet-20240620": "europe-west1"'
              )}
              {'}'}
            </>
          ),
        },
      ]

    // VolcEngine (type 45) — base_url has two mutually exclusive modes gated by
    // the secret click-to-unlock state; rendered by the drawer escape hatch.
    case 45:
      return [
        {
          kind: 'custom',
          key: 'volcengine-base-url',
          render: ctx.renderVolcEngineBaseUrl,
        },
      ]

    // Coze (type 49)
    case 49:
      return [
        {
          kind: 'input',
          name: 'other',
          label: t('Agent ID *'),
          placeholder: t('e.g., 7342866812345'),
          description: t('Enter the Coze agent ID'),
        },
      ]

    default:
      return []
  }
}

/**
 * Channel types whose provider-specific descriptors fully own the Base URL, so
 * the generic Base URL field must NOT be appended. Mirrors the previous
 * `![3, 8, 22, 36, 45].includes(currentType)` gate exactly.
 */
export const TYPES_WITHOUT_GENERIC_BASE_URL = new Set([3, 8, 22, 36, 45])

/**
 * The generic Base URL descriptor appended after the provider-specific fields
 * for every type except {@link TYPES_WITHOUT_GENERIC_BASE_URL}.
 */
export function genericBaseUrlField(
  t: TFunction,
  placeholderKey: string,
  brandName: string
): ApiAccessFieldDescriptor {
  return {
    kind: 'input',
    name: 'base_url',
    label: t('Base URL'),
    placeholder: t(placeholderKey),
    description: t(
      'Custom API base URL. For official channels, {{brandName}} has built-in addresses. Only fill this for third-party proxy sites or special endpoints. Do not add /v1 or trailing slash.',
      { brandName }
    ),
  }
}

type RenderApiAccessFieldArgs = {
  descriptor: ApiAccessFieldDescriptor
  control: Control<ChannelFormValues>
}

/**
 * Uniform renderer for one API-access descriptor. Declarative descriptors are
 * wrapped in the same `FormField` + `FormItem` markup the inline branches used;
 * `custom` descriptors defer entirely to their supplied renderer.
 */
export function renderApiAccessField({
  descriptor,
  control,
}: RenderApiAccessFieldArgs): ReactNode {
  switch (descriptor.kind) {
    case 'custom':
      return descriptor.render()

    case 'input':
      return (
        <FormField
          control={control}
          name={descriptor.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{descriptor.label}</FormLabel>
              <FormControl>
                {/* All `input` descriptors target string-typed fields
                    (base_url / other / azure_responses_version), so the field
                    value is narrowed to a string for the control. */}
                <Input
                  placeholder={descriptor.placeholder}
                  name={field.name}
                  ref={field.ref}
                  value={(field.value as string | undefined) ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                />
              </FormControl>
              {descriptor.description ? (
                <FormDescription>{descriptor.description}</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'textarea':
      return (
        <FormField
          control={control}
          name={descriptor.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{descriptor.label}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={descriptor.placeholder}
                  rows={descriptor.rows}
                  name={field.name}
                  ref={field.ref}
                  value={(field.value as string | undefined) ?? ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                />
              </FormControl>
              {descriptor.description ? (
                <FormDescription>{descriptor.description}</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />
      )

    case 'select':
      return (
        <FormField
          control={control}
          name={descriptor.name}
          render={({ field }) => {
            const value = String(field.value ?? '')
            return (
              <FormItem>
                <FormLabel>{descriptor.label}</FormLabel>
                <Select
                  items={descriptor.options.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={descriptor.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {descriptor.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {descriptor.description ? (
                  <FormDescription>
                    {descriptor.description(value)}
                  </FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            )
          }}
        />
      )

    case 'switch':
      return (
        <FormField
          control={control}
          name={descriptor.name}
          render={({ field }) => (
            <FormItem className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <FormLabel>{descriptor.label}</FormLabel>
                {descriptor.description ? (
                  <FormDescription>{descriptor.description}</FormDescription>
                ) : null}
              </div>
              <FormControl>
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )

    default:
      return null
  }
}
