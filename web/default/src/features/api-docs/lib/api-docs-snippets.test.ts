import { describe, expect, it } from 'vitest'
import {
  buildCurl,
  buildJs,
  buildPython,
  buildRequestBody,
  type ApiDocsBuilderState,
} from './api-docs-snippets'

const sample: ApiDocsBuilderState = {
  model: 'gpt-4o',
  systemPrompt: 'You are helpful.',
  userMessage: 'Hi',
  temperature: 0.5,
  maxTokens: 128,
  stream: false,
}

describe('api-docs-snippets', () => {
  it('buildRequestBody includes system message when set', () => {
    const body = buildRequestBody(sample)
    expect(body.model).toBe('gpt-4o')
    expect(body.messages).toHaveLength(2)
    expect(body.messages[0]).toEqual({ role: 'system', content: 'You are helpful.' })
    expect(body.max_tokens).toBe(128)
  })

  it('buildRequestBody omits empty system prompt', () => {
    const body = buildRequestBody({ ...sample, systemPrompt: '   ' })
    expect(body.messages).toHaveLength(1)
    expect(body.messages[0].role).toBe('user')
  })

  it('buildCurl uses base origin and chat completions path', () => {
    const curl = buildCurl('https://example.com', sample)
    expect(curl).toContain('https://example.com/v1/chat/completions')
    expect(curl).toContain('gpt-4o')
  })

  it('buildPython and buildJs reflect model and temperature', () => {
    expect(buildPython('https://host', sample)).toContain('gpt-4o')
    expect(buildPython('https://host', sample)).toContain('temperature=0.5')
    expect(buildJs('https://host', sample)).toContain('"temperature": 0.5')
  })
})
