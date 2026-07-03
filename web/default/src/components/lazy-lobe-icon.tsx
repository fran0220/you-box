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
/**
 * Lazy renderer for curated @lobehub/icons modules.
 *
 * The package barrel pulls every provider icon into one multi-megabyte async
 * chunk. Keep this file on explicit per-provider imports so channel/model
 * lists only fetch icons that are actually visible. Use via getLobeIcon() from
 * '@/lib/lobe-icon'.
 */
import { useEffect, useMemo, useState } from 'react'

type IconComponent = React.ElementType<Record<string, unknown>>
type IconModuleDefault = unknown
type IconModule = { default: IconModuleDefault }
type IconLoader = () => Promise<IconModule>

const LOBE_ICON_LOADERS = {
  Ai360: () => import('@lobehub/icons/es/Ai360'),
  Alibaba: () => import('@lobehub/icons/es/Alibaba'),
  AlibabaCloud: () => import('@lobehub/icons/es/AlibabaCloud'),
  Anthropic: () => import('@lobehub/icons/es/Anthropic'),
  Aws: () => import('@lobehub/icons/es/Aws'),
  Azure: () => import('@lobehub/icons/es/Azure'),
  AzureAI: () => import('@lobehub/icons/es/AzureAI'),
  Baidu: () => import('@lobehub/icons/es/Baidu'),
  Bedrock: () => import('@lobehub/icons/es/Bedrock'),
  ByteDance: () => import('@lobehub/icons/es/ByteDance'),
  CherryStudio: () => import('@lobehub/icons/es/CherryStudio'),
  Claude: () => import('@lobehub/icons/es/Claude'),
  ClaudeCode: () => import('@lobehub/icons/es/ClaudeCode'),
  Cline: () => import('@lobehub/icons/es/Cline'),
  Cloudflare: () => import('@lobehub/icons/es/Cloudflare'),
  Codex: () => import('@lobehub/icons/es/Codex'),
  Cohere: () => import('@lobehub/icons/es/Cohere'),
  Coze: () => import('@lobehub/icons/es/Coze'),
  Cursor: () => import('@lobehub/icons/es/Cursor'),
  DeepSeek: () => import('@lobehub/icons/es/DeepSeek'),
  Dify: () => import('@lobehub/icons/es/Dify'),
  Doubao: () => import('@lobehub/icons/es/Doubao'),
  FastGPT: () => import('@lobehub/icons/es/FastGPT'),
  Fireworks: () => import('@lobehub/icons/es/Fireworks'),
  Gemini: () => import('@lobehub/icons/es/Gemini'),
  Github: () => import('@lobehub/icons/es/Github'),
  Google: () => import('@lobehub/icons/es/Google'),
  GoogleCloud: () => import('@lobehub/icons/es/GoogleCloud'),
  Grok: () => import('@lobehub/icons/es/Grok'),
  Groq: () => import('@lobehub/icons/es/Groq'),
  HuggingFace: () => import('@lobehub/icons/es/HuggingFace'),
  Hunyuan: () => import('@lobehub/icons/es/Hunyuan'),
  InternLM: () => import('@lobehub/icons/es/InternLM'),
  Jina: () => import('@lobehub/icons/es/Jina'),
  Jimeng: () => import('@lobehub/icons/es/Jimeng'),
  Kling: () => import('@lobehub/icons/es/Kling'),
  Kimi: () => import('@lobehub/icons/es/Kimi'),
  LmStudio: () => import('@lobehub/icons/es/LmStudio'),
  LobeHub: () => import('@lobehub/icons/es/LobeHub'),
  Meta: () => import('@lobehub/icons/es/Meta'),
  Microsoft: () => import('@lobehub/icons/es/Microsoft'),
  Midjourney: () => import('@lobehub/icons/es/Midjourney'),
  Minimax: () => import('@lobehub/icons/es/Minimax'),
  Mistral: () => import('@lobehub/icons/es/Mistral'),
  Moonshot: () => import('@lobehub/icons/es/Moonshot'),
  Nvidia: () => import('@lobehub/icons/es/Nvidia'),
  Ollama: () => import('@lobehub/icons/es/Ollama'),
  OpenAI: () => import('@lobehub/icons/es/OpenAI'),
  OpenCode: () => import('@lobehub/icons/es/OpenCode'),
  OpenRouter: () => import('@lobehub/icons/es/OpenRouter'),
  OpenWebUI: () => import('@lobehub/icons/es/OpenWebUI'),
  Perplexity: () => import('@lobehub/icons/es/Perplexity'),
  Qwen: () => import('@lobehub/icons/es/Qwen'),
  Replicate: () => import('@lobehub/icons/es/Replicate'),
  RooCode: () => import('@lobehub/icons/es/RooCode'),
  SiliconCloud: () => import('@lobehub/icons/es/SiliconCloud'),
  Spark: () => import('@lobehub/icons/es/Spark'),
  Stepfun: () => import('@lobehub/icons/es/Stepfun'),
  Suno: () => import('@lobehub/icons/es/Suno'),
  Tencent: () => import('@lobehub/icons/es/Tencent'),
  Together: () => import('@lobehub/icons/es/Together'),
  Vidu: () => import('@lobehub/icons/es/Vidu'),
  Volcengine: () => import('@lobehub/icons/es/Volcengine'),
  Wenxin: () => import('@lobehub/icons/es/Wenxin'),
  XAI: () => import('@lobehub/icons/es/XAI'),
  Xinference: () => import('@lobehub/icons/es/Xinference'),
  Yi: () => import('@lobehub/icons/es/Yi'),
  Zhipu: () => import('@lobehub/icons/es/Zhipu'),
} satisfies Record<string, IconLoader>

type LobeIconKey = keyof typeof LOBE_ICON_LOADERS
type LoadedIconState = {
  key: LobeIconKey
  icon: IconModuleDefault | null
}

const LOBE_ICON_ALIASES: Record<string, LobeIconKey> = {
  anthropic: 'Claude',
  aws: 'Aws',
  bedrock: 'Bedrock',
  bytedance: 'ByteDance',
  github: 'Github',
  googlecloud: 'GoogleCloud',
  huggingface: 'HuggingFace',
  minimax: 'Minimax',
  openai: 'OpenAI',
  siliconflow: 'SiliconCloud',
  tencentcloud: 'Tencent',
  volcengine: 'Volcengine',
  wenxin: 'Wenxin',
  xai: 'XAI',
}

const LOBE_ICON_KEYS_BY_LOWERCASE = Object.fromEntries(
  Object.keys(LOBE_ICON_LOADERS).map((key) => [key.toLowerCase(), key])
) as Record<string, LobeIconKey>

const cachedIcons = new Map<LobeIconKey, IconModuleDefault | null>()
const iconPromises = new Map<LobeIconKey, Promise<IconModuleDefault | null>>()

function resolveIconKey(baseName: string): LobeIconKey | null {
  const normalized = baseName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
  return (
    LOBE_ICON_KEYS_BY_LOWERCASE[normalized] ?? LOBE_ICON_ALIASES[normalized]
  )
}

function loadIcon(key: LobeIconKey): Promise<IconModuleDefault | null> {
  const cached = cachedIcons.get(key)
  if (cached !== undefined) return Promise.resolve(cached)

  const pending = iconPromises.get(key)
  if (pending) return pending

  const promise = LOBE_ICON_LOADERS[key]()
    .then((mod) => mod.default)
    .catch(() => null)
    .then((icon) => {
      cachedIcons.set(key, icon)
      iconPromises.delete(key)
      return icon
    })

  iconPromises.set(key, promise)
  return promise
}

function fallbackIcon(name: string, size: number): React.ReactNode {
  const firstLetter = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      className='bg-muted text-muted-foreground flex items-center justify-center rounded-full text-xs font-medium'
      style={{ width: size, height: size }}
    >
      {firstLetter}
    </div>
  )
}

function getIconRequest(trimmedName: string): {
  key: LobeIconKey
  segments: string[]
} | null {
  const segments = trimmedName.split('.')
  const key = resolveIconKey(segments[0] ?? '')
  if (!key) return null

  return {
    key,
    segments: [key, ...segments.slice(1)],
  }
}

function isIconComponent(value: unknown): value is IconComponent {
  return (
    typeof value === 'function' || (typeof value === 'object' && value !== null)
  )
}

/**
 * Parse a property value from string to appropriate type
 * @param raw - Raw string value
 * @returns Parsed value (boolean, number, or string)
 */
function parseValue(raw: string | undefined | null): string | number | boolean {
  if (raw == null) return true

  let v = String(raw).trim()

  // Remove curly braces
  if (v.startsWith('{') && v.endsWith('}')) {
    v = v.slice(1, -1).trim()
  }

  // Remove quotes
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1)
  }

  // Boolean
  if (v === 'true') return true
  if (v === 'false') return false

  // Number
  if (/^-?\d+(?:\.\d+)?$/.test(v)) return Number(v)

  // Return as string
  return v
}

function renderLobeIcon(
  baseIcon: IconModuleDefault,
  trimmedName: string,
  segments: string[],
  size: number
): React.ReactNode {
  // Parse component path and chained properties
  let IconComponent: IconComponent | undefined
  let propStartIndex: number
  const compoundIcon = baseIcon as Record<string, unknown>
  const nestedIcon = segments.length > 1 ? compoundIcon[segments[1]] : undefined

  if (isIconComponent(nestedIcon)) {
    IconComponent = nestedIcon
    propStartIndex = 2
  } else {
    IconComponent = isIconComponent(baseIcon) ? baseIcon : undefined
    propStartIndex = segments.length > 1 && /^[A-Z]/.test(segments[1]) ? 2 : 1
  }

  // Fallback if icon not found
  if (!IconComponent) {
    return fallbackIcon(trimmedName, size)
  }

  // Parse chained properties (e.g., "type={'platform'}", "shape='square'")
  const props: Record<string, string | number | boolean> = {}

  for (let i = propStartIndex; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg) continue

    const eqIdx = seg.indexOf('=')
    if (eqIdx === -1) {
      props[seg.trim()] = true
      continue
    }

    const key = seg.slice(0, eqIdx).trim()
    const valRaw = seg.slice(eqIdx + 1).trim()
    props[key] = parseValue(valRaw)
  }

  // Set size if not explicitly specified in the string
  if (props.size == null && size != null) {
    props.size = size
  }

  return <IconComponent {...props} />
}

export function LazyLobeIcon(props: { name: string; size: number }) {
  const request = useMemo(() => getIconRequest(props.name), [props.name])
  const [loadedIcon, setLoadedIcon] = useState<LoadedIconState | null>(null)

  const requestKey = request?.key

  useEffect(() => {
    if (!requestKey) {
      return
    }

    if (cachedIcons.get(requestKey) !== undefined) return

    let active = true
    loadIcon(requestKey).then((icon) => {
      if (active) setLoadedIcon({ key: requestKey, icon })
    })
    return () => {
      active = false
    }
  }, [requestKey])

  if (!request) {
    return fallbackIcon(props.name, props.size)
  }

  const cached = cachedIcons.get(request.key)
  let iconState: LoadedIconState | null = null
  if (cached !== undefined) {
    iconState = { key: request.key, icon: cached }
  } else if (loadedIcon?.key === request.key) {
    iconState = loadedIcon
  }

  if (!iconState) {
    return (
      <span
        className='inline-block shrink-0'
        style={{ width: props.size, height: props.size }}
        aria-hidden='true'
      />
    )
  }

  if (!iconState.icon) {
    return fallbackIcon(props.name, props.size)
  }

  return renderLobeIcon(iconState.icon, props.name, request.segments, props.size)
}
