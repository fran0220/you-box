
export interface ApiDocsBuilderState {
  model: string
  systemPrompt: string
  userMessage: string
  temperature: number
  maxTokens: number
  stream: boolean
}

export function buildRequestBody(state: ApiDocsBuilderState) {
  const messages: Array<{ role: string; content: string }> = []
  if (state.systemPrompt.trim()) {
    messages.push({ role: 'system', content: state.systemPrompt.trim() })
  }
  messages.push({ role: 'user', content: state.userMessage })
  return {
    model: state.model,
    messages,
    temperature: state.temperature,
    max_tokens: state.maxTokens,
    stream: state.stream,
  }
}

export function buildCurl(base: string, state: ApiDocsBuilderState): string {
  const body = JSON.stringify(buildRequestBody(state), null, 2)
  return `curl ${base}/v1/chat/completions \\
  -H "Authorization: Bearer $YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${body}'`
}

export function buildPython(base: string, state: ApiDocsBuilderState): string {
  const body = buildRequestBody(state)
  return `from openai import OpenAI

client = OpenAI(
    base_url="${base}/v1",
    api_key="YOUR_API_KEY",
)

response = client.chat.completions.create(
    model="${body.model}",
    messages=${JSON.stringify(body.messages, null, 4)},
    temperature=${body.temperature},
    max_tokens=${body.max_tokens},
    stream=${state.stream ? 'True' : 'False'},
)

print(response.choices[0].message.content)`
}

export function buildJs(base: string, state: ApiDocsBuilderState): string {
  const body = buildRequestBody(state)
  return `import OpenAI from 'openai'

const client = new OpenAI({
  baseURL: '${base}/v1',
  apiKey: 'YOUR_API_KEY',
})

const response = await client.chat.completions.create(${JSON.stringify(
    body,
    null,
    2
  )})

console.log(response.choices[0].message.content)`
}
