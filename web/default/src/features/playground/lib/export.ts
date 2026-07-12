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
import type {
  ChatCompletionRequest,
  Message,
  PlaygroundConfig,
  ParameterEnabled,
} from '../types'
import { buildChatCompletionPayload } from './payload-builder'
import { getCurrentVersion } from './message-utils'

/** Export conversation as Markdown for sharing / notes. */
export function exportConversationMarkdown(
  messages: Message[],
  title = 'Playground conversation'
): string {
  const lines: string[] = [`# ${title}`, '']
  for (const message of messages) {
    const role =
      message.from === 'user'
        ? 'User'
        : message.from === 'tool'
          ? `Tool (${message.toolCallId || 'result'})`
          : message.model
            ? `Assistant (${message.model})`
            : 'Assistant'
    const content = getCurrentVersion(message).content || ''
    lines.push(`## ${role}`, '', content || '_(empty)_', '')
    if (message.toolCalls?.length) {
      lines.push('### Tool calls', '')
      for (const tc of message.toolCalls) {
        lines.push(
          `- **${tc.function.name}** (\`${tc.id}\`)`,
          '```json',
          tc.function.arguments || '{}',
          '```',
          ''
        )
      }
    }
    if (message.reasoning?.content) {
      lines.push('### Reasoning', '', message.reasoning.content, '')
    }
  }
  return lines.join('\n')
}

/** Export full conversation as JSON (messages + optional config). */
export function exportConversationJson(
  messages: Message[],
  config?: PlaygroundConfig
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      config: config ?? null,
      messages,
    },
    null,
    2
  )
}

/**
 * Build a copy-pasteable cURL for the last request shape, using the active
 * config and history. Uses a placeholder API key — playground itself uses
 * session auth, but customers typically call /v1 with a key.
 */
export function buildCopyAsCurl(
  messages: Message[],
  config: PlaygroundConfig,
  parameterEnabled: ParameterEnabled,
  opts?: { baseUrl?: string; model?: string }
): string {
  const payload: ChatCompletionRequest = buildChatCompletionPayload(
    messages,
    config,
    parameterEnabled,
    {
      model: opts?.model ?? config.model,
      scopeHistoryToModel: true,
    }
  )
  const base = (opts?.baseUrl || window.location.origin).replace(/\/$/, '')
  const body = JSON.stringify(payload)
  // Escape single quotes for POSIX single-quoted string.
  const escaped = body.replace(/'/g, `'\\''`)
  return [
    `curl ${base}/v1/chat/completions \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -H 'Authorization: Bearer sk-YOUR_KEY' \\`,
    `  -d '${escaped}'`,
  ].join('\n')
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/plain;charset=utf-8'
): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
