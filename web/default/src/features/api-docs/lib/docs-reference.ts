export type DocsParamRow = {
  field: string
  type: string
  description: string
  required?: boolean
}

export type DocsErrorRow = {
  code: string
  variant: 'neutral' | 'warning' | 'danger'
  meaning: string
}

export const CHAT_COMPLETION_PARAMS: DocsParamRow[] = [
  {
    field: 'model',
    type: 'string',
    description: 'Provider-prefixed slug, e.g. openai/gpt-4o.',
    required: true,
  },
  {
    field: 'messages',
    type: 'array',
    description: 'Conversation history as role/content objects.',
    required: true,
  },
  {
    field: 'stream',
    type: 'boolean',
    description: 'Stream tokens as server-sent events. Default false.',
  },
  {
    field: 'temperature',
    type: 'number',
    description: 'Sampling temperature, 0–2. Default 1.',
  },
  {
    field: 'max_tokens',
    type: 'integer',
    description: 'Maximum completion tokens to generate.',
  },
  {
    field: 'route',
    type: 'string',
    description: '{{brandName}} routing strategy: cost, latency, or quality.',
  },
  {
    field: 'fallbacks',
    type: 'array',
    description: 'Ordered model slugs to try if the primary fails.',
  },
]

export const API_ERROR_CODES: DocsErrorRow[] = [
  {
    code: '401',
    variant: 'neutral',
    meaning: 'Missing or invalid API key.',
  },
  {
    code: '429',
    variant: 'warning',
    meaning: 'Rate limit or budget exceeded — back off and retry.',
  },
  {
    code: '502',
    variant: 'danger',
    meaning: 'All upstream providers failed after failover.',
  },
]

export const SAMPLE_RESPONSE_JSON = `{
  "id": "chatcmpl-7f3a9c",
  "model": "anthropic/claude-opus-4.6",
  "choices": [{
    "message": { "role": "assistant", "content": "Hi!" }
  }],
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 2
  }
}`
