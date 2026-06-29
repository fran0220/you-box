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
