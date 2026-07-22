import { useMemo, useState } from 'react'
import {
  ChevronRight,
  KeyRound,
  ScrollText,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { BundledLanguage } from 'shiki/bundle/web'
import { useStatus } from '@/hooks/use-status'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/ai-elements/code-block'
import { ENDPOINT_TYPES, getEndpointTypeLabels } from '../constants'
import { replaceModelInPath } from '../lib/model-helpers'
import type { PricingModel, SupportedEndpointInfo } from '../types'

// ---------------------------------------------------------------------------
// Code-sample registry
// ---------------------------------------------------------------------------
//
// Each sample is keyed by language and endpoint type. The endpoint type comes
// from the model's `supported_endpoint_types`; we render samples only for the
// types the model actually supports. This keeps copy-pasted code accurate and
// provider-shaped (OpenAI vs Anthropic vs Gemini, etc.).

type Lang = 'curl' | 'python' | 'typescript' | 'javascript'

const LANG_LABELS: Record<Lang, string> = {
  curl: 'cURL',
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
}

const LANG_HIGHLIGHT: Record<Lang, BundledLanguage> = {
  curl: 'bash',
  python: 'python',
  typescript: 'typescript',
  javascript: 'javascript',
}

// Chrome-bar filename shown in the CodeBlock title bar (R2-B14 #5); the
// built-in copy button in the bar replaces the old floating copy control.
const LANG_TITLES: Record<Lang, string> = {
  curl: 'curl',
  python: 'main.py',
  typescript: 'client.ts',
  javascript: 'client.js',
}

type SampleContext = {
  baseUrl: string
  apiKeyEnv: string
  modelName: string
  endpointType: string
  endpointPath: string
}

function buildChatSample(lang: Lang, ctx: SampleContext): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}`
  const isResponses = ctx.endpointType === 'openai-response'
  const isReasoning = /^o[1-4]|reasoning|thinking|deepseek-r/i.test(
    ctx.modelName
  )
  const userMessage = 'Explain quantum entanglement in one paragraph.'

  const bodyJson = isResponses
    ? JSON.stringify({ model: ctx.modelName, input: userMessage }, null, 2)
    : JSON.stringify(
        {
          model: ctx.modelName,
          messages: [{ role: 'user', content: userMessage }],
          ...(isReasoning ? {} : { temperature: 0.7 }),
        },
        null,
        2
      )

  const fnCall = isResponses ? 'responses.create' : 'chat.completions.create'

  if (lang === 'curl') {
    return [
      `curl ${url} \\`,
      `  -H "Authorization: Bearer $${ctx.apiKeyEnv}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${bodyJson.replace(/\n/g, '\n     ')}'`,
    ].join('\n')
  }

  if (lang === 'python') {
    return [
      'from openai import OpenAI',
      '',
      'client = OpenAI(',
      `    base_url="${ctx.baseUrl}/v1",`,
      `    api_key="<YOUR_API_KEY>",`,
      ')',
      '',
      isResponses
        ? `response = client.${fnCall}(\n    model="${ctx.modelName}",\n    input="${userMessage}",\n)\n\nprint(response.output_text)`
        : `completion = client.${fnCall}(\n    model="${ctx.modelName}",\n    messages=[\n        {"role": "user", "content": "${userMessage}"}\n    ],\n)\n\nprint(completion.choices[0].message.content)`,
    ].join('\n')
  }

  if (lang === 'typescript') {
    return [
      `import OpenAI from 'openai'`,
      '',
      `const client = new OpenAI({`,
      `  baseURL: '${ctx.baseUrl}/v1',`,
      `  apiKey: process.env.${ctx.apiKeyEnv},`,
      `})`,
      '',
      isResponses
        ? `const response = await client.${fnCall}({\n  model: '${ctx.modelName}',\n  input: '${userMessage}',\n})\n\nconsole.log(response.output_text)`
        : `const completion = await client.${fnCall}({\n  model: '${ctx.modelName}',\n  messages: [{ role: 'user', content: '${userMessage}' }],\n})\n\nconsole.log(completion.choices[0].message.content)`,
    ].join('\n')
  }

  return [
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.${ctx.apiKeyEnv}}\`,`,
    `    'Content-Type': 'application/json',`,
    `  },`,
    `  body: JSON.stringify(${bodyJson}),`,
    `})`,
    '',
    `const data = await response.json()`,
    `console.log(data)`,
  ].join('\n')
}

function buildAnthropicSample(lang: Lang, ctx: SampleContext): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}`
  const userMessage = 'Explain quantum entanglement in one paragraph.'

  if (lang === 'curl') {
    const body = JSON.stringify(
      {
        model: ctx.modelName,
        max_tokens: 1024,
        messages: [{ role: 'user', content: userMessage }],
      },
      null,
      2
    )
    return [
      `curl ${url} \\`,
      `  -H "x-api-key: $${ctx.apiKeyEnv}" \\`,
      `  -H "anthropic-version: 2023-06-01" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${body.replace(/\n/g, '\n     ')}'`,
    ].join('\n')
  }
  if (lang === 'python') {
    return [
      'import anthropic',
      '',
      'client = anthropic.Anthropic(',
      `    base_url="${ctx.baseUrl}",`,
      `    api_key="<YOUR_API_KEY>",`,
      ')',
      '',
      `message = client.messages.create(`,
      `    model="${ctx.modelName}",`,
      `    max_tokens=1024,`,
      `    messages=[{"role": "user", "content": "${userMessage}"}],`,
      ')',
      '',
      'print(message.content[0].text)',
    ].join('\n')
  }
  if (lang === 'typescript') {
    return [
      `import Anthropic from '@anthropic-ai/sdk'`,
      '',
      `const client = new Anthropic({`,
      `  baseURL: '${ctx.baseUrl}',`,
      `  apiKey: process.env.${ctx.apiKeyEnv},`,
      `})`,
      '',
      `const message = await client.messages.create({`,
      `  model: '${ctx.modelName}',`,
      `  max_tokens: 1024,`,
      `  messages: [{ role: 'user', content: '${userMessage}' }],`,
      `})`,
      '',
      `console.log(message.content[0].text)`,
    ].join('\n')
  }
  return [
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: {`,
    `    'x-api-key': process.env.${ctx.apiKeyEnv},`,
    `    'anthropic-version': '2023-06-01',`,
    `    'Content-Type': 'application/json',`,
    `  },`,
    `  body: JSON.stringify({`,
    `    model: '${ctx.modelName}',`,
    `    max_tokens: 1024,`,
    `    messages: [{ role: 'user', content: '${userMessage}' }],`,
    `  }),`,
    `})`,
    '',
    `const data = await response.json()`,
    `console.log(data.content[0].text)`,
  ].join('\n')
}

function buildGeminiSample(lang: Lang, ctx: SampleContext): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}?key=$${ctx.apiKeyEnv}`
  const userMessage = 'Explain quantum entanglement in one paragraph.'

  if (lang === 'curl') {
    const body = JSON.stringify(
      { contents: [{ parts: [{ text: userMessage }] }] },
      null,
      2
    )
    return [
      `curl '${url}' \\`,
      `  -H 'Content-Type: application/json' \\`,
      `  -d '${body.replace(/\n/g, '\n     ')}'`,
    ].join('\n')
  }
  if (lang === 'python') {
    return [
      'import google.generativeai as genai',
      '',
      `genai.configure(api_key="<YOUR_API_KEY>")`,
      '',
      `model = genai.GenerativeModel("${ctx.modelName}")`,
      `response = model.generate_content("${userMessage}")`,
      '',
      `print(response.text)`,
    ].join('\n')
  }
  if (lang === 'typescript') {
    return [
      `import { GoogleGenerativeAI } from '@google/generative-ai'`,
      '',
      `const genAI = new GoogleGenerativeAI(process.env.${ctx.apiKeyEnv}!)`,
      `const model = genAI.getGenerativeModel({ model: '${ctx.modelName}' })`,
      '',
      `const result = await model.generateContent('${userMessage}')`,
      `console.log(result.response.text())`,
    ].join('\n')
  }
  return [
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: { 'Content-Type': 'application/json' },`,
    `  body: JSON.stringify({`,
    `    contents: [{ parts: [{ text: '${userMessage}' }] }],`,
    `  }),`,
    `})`,
    '',
    `const data = await response.json()`,
    `console.log(data.candidates[0].content.parts[0].text)`,
  ].join('\n')
}

function buildEmbeddingSample(lang: Lang, ctx: SampleContext): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}`
  const text = 'The food was delicious and the waiter…'

  if (lang === 'curl') {
    const body = JSON.stringify({ model: ctx.modelName, input: text }, null, 2)
    return [
      `curl ${url} \\`,
      `  -H "Authorization: Bearer $${ctx.apiKeyEnv}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${body.replace(/\n/g, '\n     ')}'`,
    ].join('\n')
  }
  if (lang === 'python') {
    return [
      'from openai import OpenAI',
      '',
      `client = OpenAI(base_url="${ctx.baseUrl}/v1", api_key="<YOUR_API_KEY>")`,
      '',
      'response = client.embeddings.create(',
      `    model="${ctx.modelName}",`,
      `    input="${text}",`,
      ')',
      '',
      'print(response.data[0].embedding[:8])',
    ].join('\n')
  }
  if (lang === 'typescript') {
    return [
      `import OpenAI from 'openai'`,
      '',
      `const client = new OpenAI({`,
      `  baseURL: '${ctx.baseUrl}/v1',`,
      `  apiKey: process.env.${ctx.apiKeyEnv},`,
      `})`,
      '',
      `const response = await client.embeddings.create({`,
      `  model: '${ctx.modelName}',`,
      `  input: '${text}',`,
      `})`,
      '',
      `console.log(response.data[0].embedding.slice(0, 8))`,
    ].join('\n')
  }
  return [
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.${ctx.apiKeyEnv}}\`,`,
    `    'Content-Type': 'application/json',`,
    `  },`,
    `  body: JSON.stringify({`,
    `    model: '${ctx.modelName}',`,
    `    input: '${text}',`,
    `  }),`,
    `})`,
    '',
    `const data = await response.json()`,
    `console.log(data.data[0].embedding.slice(0, 8))`,
  ].join('\n')
}

function buildImageSample(lang: Lang, ctx: SampleContext): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}`
  const prompt = 'A serene koi pond at sunset, ukiyo-e style.'

  if (lang === 'curl') {
    const body = JSON.stringify(
      { model: ctx.modelName, prompt, size: '1024x1024', n: 1 },
      null,
      2
    )
    return [
      `curl ${url} \\`,
      `  -H "Authorization: Bearer $${ctx.apiKeyEnv}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${body.replace(/\n/g, '\n     ')}'`,
    ].join('\n')
  }
  if (lang === 'python') {
    return [
      'from openai import OpenAI',
      '',
      `client = OpenAI(base_url="${ctx.baseUrl}/v1", api_key="<YOUR_API_KEY>")`,
      '',
      'response = client.images.generate(',
      `    model="${ctx.modelName}",`,
      `    prompt="${prompt}",`,
      `    size="1024x1024",`,
      `    n=1,`,
      ')',
      '',
      'print(response.data[0].url)',
    ].join('\n')
  }
  if (lang === 'typescript') {
    return [
      `import OpenAI from 'openai'`,
      '',
      `const client = new OpenAI({`,
      `  baseURL: '${ctx.baseUrl}/v1',`,
      `  apiKey: process.env.${ctx.apiKeyEnv},`,
      `})`,
      '',
      `const response = await client.images.generate({`,
      `  model: '${ctx.modelName}',`,
      `  prompt: '${prompt}',`,
      `  size: '1024x1024',`,
      `  n: 1,`,
      `})`,
      '',
      `console.log(response.data[0].url)`,
    ].join('\n')
  }
  return [
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.${ctx.apiKeyEnv}}\`,`,
    `    'Content-Type': 'application/json',`,
    `  },`,
    `  body: JSON.stringify({`,
    `    model: '${ctx.modelName}',`,
    `    prompt: '${prompt}',`,
    `    size: '1024x1024',`,
    `    n: 1,`,
    `  }),`,
    `})`,
    '',
    `const data = await response.json()`,
    `console.log(data.data[0].url)`,
  ].join('\n')
}

function buildElevenLabsJsonAudioSample(
  lang: Lang,
  ctx: SampleContext,
  body: Record<string, unknown>,
  outputFile: string
): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}`
  const bodyJson = JSON.stringify(body, null, 2)

  if (lang === 'curl') {
    return [
      `curl ${url} \\`,
      `  -H "Authorization: Bearer $${ctx.apiKeyEnv}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${bodyJson.replace(/\n/g, '\n     ')}' \\`,
      `  --output ${outputFile}`,
    ].join('\n')
  }

  if (lang === 'python') {
    return [
      'import requests',
      '',
      `response = requests.post(`,
      `    "${url}",`,
      `    headers={"Authorization": "Bearer <YOUR_API_KEY>"},`,
      `    json=${bodyJson.replace(/\n/g, '\n         ')},`,
      ')',
      'response.raise_for_status()',
      `open("${outputFile}", "wb").write(response.content)`,
    ].join('\n')
  }

  return [
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.${ctx.apiKeyEnv}}\`,`,
    `    'Content-Type': 'application/json',`,
    `  },`,
    `  body: JSON.stringify(${bodyJson}),`,
    `})`,
    '',
    `const audio = await response.arrayBuffer()`,
    `console.log('Generated ${outputFile}', audio.byteLength)`,
  ].join('\n')
}

function buildElevenLabsMultipartAudioSample(
  lang: Lang,
  ctx: SampleContext,
  fields: Record<string, string>,
  fileField: string,
  fileName: string,
  outputFile?: string
): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}`

  if (lang === 'curl') {
    const formArgs = [
      `-F "${fileField}=@${fileName}"`,
      ...Object.entries(fields).map(([key, value]) => `-F "${key}=${value}"`),
    ]
    const lines = [
      `curl ${url} \\`,
      `  -H "Authorization: Bearer $${ctx.apiKeyEnv}" \\`,
    ]
    formArgs.forEach((arg, index) => {
      const isLast = index === formArgs.length - 1 && !outputFile
      lines.push(`  ${arg}${isLast ? '' : ' \\'}`)
    })
    if (outputFile) lines.push(`  --output ${outputFile}`)
    return lines.join('\n')
  }

  if (lang === 'python') {
    const data = JSON.stringify(fields, null, 4)
    const responseLine = outputFile
      ? `open("${outputFile}", "wb").write(response.content)`
      : 'print(response.json())'
    return [
      'import requests',
      '',
      `with open("${fileName}", "rb") as audio_file:`,
      `    response = requests.post(`,
      `        "${url}",`,
      `        headers={"Authorization": "Bearer <YOUR_API_KEY>"},`,
      `        files={"${fileField}": audio_file},`,
      `        data=${data.replace(/\n/g, '\n             ')},`,
      '    )',
      'response.raise_for_status()',
      responseLine,
    ].join('\n')
  }

  const appendFields = Object.entries(fields).map(
    ([key, value]) => `form.append('${key}', '${value}')`
  )
  const resultLine = outputFile
    ? `console.log('Generated ${outputFile}', (await response.arrayBuffer()).byteLength)`
    : `console.log(await response.json())`
  return [
    `const form = new FormData()`,
    `form.append('${fileField}', fileInput.files[0]) // ${fileName}`,
    ...appendFields,
    '',
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: { Authorization: \`Bearer \${process.env.${ctx.apiKeyEnv}}\` },`,
    `  body: form,`,
    `})`,
    '',
    resultLine,
  ].join('\n')
}

function buildAudioSample(lang: Lang, ctx: SampleContext): string {
  const voicePath = ctx.endpointPath.replace(
    '{voice_id}',
    '21m00Tcm4TlvDq8ikWAM'
  )
  const audioCtx = { ...ctx, endpointPath: voicePath }

  if (ctx.endpointType === ENDPOINT_TYPES.AUDIO_STT) {
    return buildElevenLabsMultipartAudioSample(
      lang,
      ctx,
      { model: ctx.modelName },
      'file',
      'speech.mp3'
    )
  }
  if (ctx.endpointType === ENDPOINT_TYPES.AUDIO_SPEECH_TO_SPEECH) {
    return buildElevenLabsMultipartAudioSample(
      lang,
      audioCtx,
      { model_id: ctx.modelName },
      'audio',
      'speech.mp3',
      'converted.mp3'
    )
  }
  if (ctx.endpointType === ENDPOINT_TYPES.AUDIO_SFX) {
    return buildElevenLabsJsonAudioSample(
      lang,
      ctx,
      {
        text: 'A short soft notification chime',
        model_id: ctx.modelName,
        duration_seconds: 1.5,
        prompt_influence: 0.5,
      },
      'sfx.mp3'
    )
  }
  if (ctx.endpointType === ENDPOINT_TYPES.AUDIO_MUSIC) {
    return buildElevenLabsJsonAudioSample(
      lang,
      ctx,
      {
        prompt: 'Three second instrumental soft synth logo sting',
        model_id: ctx.modelName,
        music_length_ms: 3000,
        force_instrumental: true,
      },
      'music.mp3'
    )
  }
  if (ctx.endpointType === ENDPOINT_TYPES.AUDIO_ISOLATION) {
    return buildElevenLabsMultipartAudioSample(
      lang,
      ctx,
      {},
      'audio',
      'noisy-speech.mp3',
      'isolated.mp3'
    )
  }
  if (ctx.endpointType === ENDPOINT_TYPES.AUDIO_ALIGNMENT) {
    return buildElevenLabsMultipartAudioSample(
      lang,
      ctx,
      { text: 'Smoke test.' },
      'file',
      'speech.mp3'
    )
  }

  return buildElevenLabsJsonAudioSample(
    lang,
    ctx,
    {
      model: ctx.modelName,
      input: 'Hello from ElevenLabs.',
      voice: '21m00Tcm4TlvDq8ikWAM',
      response_format: 'mp3',
    },
    'speech.mp3'
  )
}

function buildModel3DSample(lang: Lang, ctx: SampleContext): string {
  const url = `${ctx.baseUrl}${ctx.endpointPath}`
  const body = (() => {
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_TEXT) {
      return {
        mode: 'preview',
        prompt: 'a stylized treasure chest',
        ai_model: 'latest',
      }
    }
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_IMAGE) {
      return {
        image_url: 'https://example.com/reference.png',
        ai_model: 'latest',
        should_texture: true,
      }
    }
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_MULTI_IMAGE) {
      return {
        image_urls: [
          'https://example.com/front.png',
          'https://example.com/side.png',
        ],
        ai_model: 'latest',
        should_texture: true,
      }
    }
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_RETEXTURE) {
      return {
        model_url: 'https://example.com/model.glb',
        text_style_prompt: 'painted brass and blue ceramic',
        enable_pbr: true,
      }
    }
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_RIGGING) {
      return {
        model_url: 'https://example.com/humanoid.glb',
        height_meters: 1.8,
      }
    }
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_CHARACTER_ANIMATION) {
      return { rig_task_id: 'completed-rig-task-id', action_id: 92 }
    }
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_CONVERT) {
      return {
        input_task_id: 'completed-task-id',
        target_formats: ['glb', 'fbx'],
      }
    }
    if (ctx.endpointType === ENDPOINT_TYPES.MODEL_3D_RESIZE) {
      return {
        input_task_id: 'completed-task-id',
        resize_height: 1.0,
        origin_at: 'bottom',
      }
    }
    return {
      input_task_id: 'completed-task-id',
      target_formats: ['glb'],
      topology: 'quad',
    }
  })()
  const bodyJson = JSON.stringify(body, null, 2)

  if (lang === 'curl') {
    return [
      `curl ${url} \\`,
      `  -H "Authorization: Bearer $${ctx.apiKeyEnv}" \\`,
      `  -H "Content-Type: application/json" \\`,
      `  -d '${bodyJson.replace(/\n/g, '\n     ')}'`,
    ].join('\n')
  }
  if (lang === 'python') {
    return [
      'import requests',
      '',
      `response = requests.post(`,
      `    "${url}",`,
      `    headers={"Authorization": "Bearer <YOUR_API_KEY>"},`,
      `    json=${bodyJson.replace(/\n/g, '\n         ')},`,
      ')',
      'response.raise_for_status()',
      'task_id = response.json()["result"]',
      'print("Task created:", task_id)',
    ].join('\n')
  }
  return [
    `const response = await fetch('${url}', {`,
    `  method: 'POST',`,
    `  headers: {`,
    `    Authorization: \`Bearer \${process.env.${ctx.apiKeyEnv}}\`,`,
    `    'Content-Type': 'application/json',`,
    `  },`,
    `  body: JSON.stringify(${bodyJson}),`,
    `})`,
    '',
    `const data = await response.json()`,
    `console.log('Task created:', data.result)`,
  ].join('\n')
}

function buildSample(
  lang: Lang,
  endpointType: string,
  ctx: SampleContext
): string {
  if (
    endpointType === ENDPOINT_TYPES.AUDIO ||
    endpointType.startsWith('audio-')
  ) {
    return buildAudioSample(lang, ctx)
  }
  if (endpointType.startsWith('model-3d')) return buildModel3DSample(lang, ctx)
  if (endpointType === 'anthropic') return buildAnthropicSample(lang, ctx)
  if (endpointType === 'gemini') return buildGeminiSample(lang, ctx)
  if (endpointType === 'embeddings' || endpointType === 'jina-rerank')
    return buildEmbeddingSample(lang, ctx)
  if (endpointType === 'image-generation') return buildImageSample(lang, ctx)
  return buildChatSample(lang, ctx)
}

// ---------------------------------------------------------------------------
// Code samples section
// ---------------------------------------------------------------------------

function CodeSamplesSection(props: {
  model: PricingModel
  endpointMap: Record<string, SupportedEndpointInfo>
}) {
  const { t } = useTranslation()
  const { status } = useStatus()
  const endpointLabels = useMemo(() => getEndpointTypeLabels(t), [t])

  const baseUrl = useMemo(() => {
    const candidate =
      (status as Record<string, unknown> | null)?.server_address ??
      (status as Record<string, unknown> | null)?.serverAddress ??
      (status?.data as Record<string, unknown> | undefined)?.server_address ??
      (status?.data as Record<string, unknown> | undefined)?.serverAddress
    if (candidate && typeof candidate === 'string') {
      return candidate.replace(/\/$/, '')
    }
    if (typeof window !== 'undefined') return window.location.origin
    return 'https://api.example.com'
  }, [status])

  const endpoints = useMemo(() => {
    const types = props.model.supported_endpoint_types || []
    return types
      .map((type) => {
        const info = props.endpointMap[type] || {}
        let path = info.path || ''
        if (path && path.includes('{model}')) {
          path = replaceModelInPath(path, props.model.model_name || '')
        }
        return { type, path, method: info.method || 'POST' }
      })
      .filter((e) => Boolean(e.path))
  }, [props.model, props.endpointMap])

  const [endpointType, setEndpointType] = useState<string>(
    endpoints[0]?.type ?? ''
  )
  const [lang, setLang] = useState<Lang>('curl')

  const activeEndpoint = useMemo(() => {
    return endpoints.find((e) => e.type === endpointType) ?? endpoints[0]
  }, [endpointType, endpoints])

  if (endpoints.length === 0 || !activeEndpoint) {
    return null
  }

  const code = buildSample(lang, activeEndpoint.type, {
    baseUrl,
    apiKeyEnv: 'NEW_API_KEY',
    modelName: props.model.model_name || '',
    endpointType: activeEndpoint.type,
    endpointPath: activeEndpoint.path,
  })

  return (
    <section>
      <SectionTitle icon={ScrollText}>{t('Code samples')}</SectionTitle>

      <div className='flex flex-wrap items-center gap-2'>
        {endpoints.length > 1 && (
          <Tabs value={endpointType} onValueChange={setEndpointType}>
            <TabsList className='bg-muted/40 h-8 p-0.5'>
              {endpoints.map((ep) => (
                <TabsTrigger
                  key={ep.type}
                  value={ep.type}
                  className='h-7 px-2.5 text-xs'
                >
                  {(endpointLabels as Record<string, string>)[ep.type] ??
                    ep.type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        <Tabs
          value={lang}
          onValueChange={(v) => setLang(v as Lang)}
          className='ml-auto'
        >
          <TabsList className='bg-muted/40 h-8 p-0.5'>
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <TabsTrigger key={l} value={l} className='h-7 px-2.5 text-xs'>
                {LANG_LABELS[l]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className='mt-3'>
        <CodeBlock
          code={code}
          language={LANG_HIGHLIGHT[lang]}
          title={LANG_TITLES[lang]}
        />
      </div>

      <p className='text-muted-foreground mt-2 text-xs'>
        {t('Replace')}{' '}
        <code className='bg-muted rounded px-1 py-0.5 font-mono text-[11px]'>
          {'<YOUR_API_KEY>'}
        </code>{' '}
        {t('with the API key from your token settings.')}
      </p>
    </section>
  )
}

export function ModelDetailsProviderInfo(props: { model: PricingModel }) {
  const { t } = useTranslation()
  const endpoints = props.model.supported_endpoint_types ?? []
  const endpointLabels = getEndpointTypeLabels(t) as Record<string, string>
  const endpointText = endpoints
    .map((endpoint) => endpointLabels[endpoint] ?? endpoint)
    .join(', ')

  return (
    <section>
      <SectionTitle icon={ShieldCheck}>{t('Catalog')}</SectionTitle>
      <div className='border-border/60 bg-border/60 grid grid-cols-1 gap-px overflow-hidden rounded-lg border sm:grid-cols-2'>
        <InfoCell label={t('Vendor')}>
          <span className='text-sm font-medium'>
            {props.model.vendor_name ?? '—'}
          </span>
        </InfoCell>
        <InfoCell label={t('Endpoint types')}>
          <span className='text-sm'>
            {endpoints.length > 0 ? endpointText : '—'}
          </span>
        </InfoCell>
        {props.model.vendor_description ? (
          <InfoCell label={t('Provider notes')}>
            <span className='text-muted-foreground text-sm'>
              {props.model.vendor_description}
            </span>
          </InfoCell>
        ) : null}
      </div>
    </section>
  )
}

function InfoCell(props: { label: string; children: React.ReactNode }) {
  return (
    <div className='bg-card flex flex-col gap-1 px-3 py-2.5'>
      <span className='text-muted-foreground text-[10px] font-medium tracking-wider uppercase'>
        {props.label}
      </span>
      {props.children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Authentication preview
// ---------------------------------------------------------------------------

function AuthSection() {
  const { t } = useTranslation()
  return (
    <section>
      <SectionTitle icon={KeyRound}>{t('Authentication')}</SectionTitle>
      <div className='border-border/60 bg-muted/20 flex items-start gap-2 rounded-lg border p-3'>
        <ChevronRight className='text-muted-foreground mt-0.5 size-3.5 shrink-0' />
        <div className='space-y-1.5 text-xs leading-relaxed'>
          <p>
            {t('All requests must include')}{' '}
            <code className='bg-muted rounded px-1 py-0.5 font-mono text-[11px]'>
              Authorization: Bearer &lt;TOKEN&gt;
            </code>{' '}
            {t('header. Anthropic-formatted endpoints accept the')}{' '}
            <code className='bg-muted rounded px-1 py-0.5 font-mono text-[11px]'>
              x-api-key
            </code>{' '}
            {t('header instead.')}
          </p>
          <p className='text-muted-foreground'>
            {t(
              'Generate tokens from the Tokens page; you can scope them to specific models, groups, IPs, and rate-limits.'
            )}
          </p>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Composite API tab
// ---------------------------------------------------------------------------

export function ModelDetailsApi(props: {
  model: PricingModel
  endpointMap: Record<string, SupportedEndpointInfo>
}) {
  return (
    <div className='space-y-6'>
      <CodeSamplesSection model={props.model} endpointMap={props.endpointMap} />
      <AuthSection />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Local UI helpers
// ---------------------------------------------------------------------------

function SectionTitle(props: {
  children: React.ReactNode
  icon: React.ComponentType<{ className?: string }>
}) {
  const Icon = props.icon
  return (
    <h3 className='text-foreground mb-3 flex items-center gap-1.5 text-sm font-semibold'>
      <Icon className='text-muted-foreground/70 size-3.5' />
      {props.children}
    </h3>
  )
}

// Re-export so the parent can keep its own SectionTitle if it wants:
export { Zap as ApiTabIcon }
