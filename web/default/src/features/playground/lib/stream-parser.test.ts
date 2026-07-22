import { describe, expect, it } from 'vitest'
import {
  applyToolCallDelta,
  finalizeToolCalls,
  parseSseData,
  type ToolCallAccumulator,
} from './stream-parser'

describe('parseSseData', () => {
  it('handles [DONE]', () => {
    expect(parseSseData('[DONE]')).toEqual([{ kind: 'done' }])
  })

  it('parses content and reasoning deltas', () => {
    const events = parseSseData(
      JSON.stringify({
        choices: [
          {
            index: 0,
            delta: {
              content: 'hello',
              reasoning_content: 'think',
            },
            finish_reason: null,
          },
        ],
      })
    )
    expect(events).toEqual(
      expect.arrayContaining([
        { kind: 'content', text: 'hello' },
        { kind: 'reasoning', text: 'think' },
      ])
    )
  })

  it('parses tool_calls deltas and usage-only chunks', () => {
    const toolEvents = parseSseData(
      JSON.stringify({
        choices: [
          {
            index: 0,
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_1',
                  type: 'function',
                  function: { name: 'get_weather', arguments: '{"c' },
                },
              ],
            },
            finish_reason: null,
          },
        ],
      })
    )
    expect(toolEvents).toContainEqual({
      kind: 'tool_call_delta',
      index: 0,
      id: 'call_1',
      name: 'get_weather',
      arguments: '{"c',
    })

    const usageEvents = parseSseData(
      JSON.stringify({
        choices: [],
        usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
      })
    )
    expect(usageEvents).toEqual([
      {
        kind: 'usage',
        usage: { prompt_tokens: 1, completion_tokens: 2, total_tokens: 3 },
      },
    ])
  })

  it('parses finish_reason and refusal', () => {
    const events = parseSseData(
      JSON.stringify({
        choices: [
          {
            index: 0,
            delta: { refusal: 'nope' },
            finish_reason: 'stop',
          },
        ],
      })
    )
    expect(events).toEqual(
      expect.arrayContaining([
        { kind: 'finish', finishReason: 'stop' },
        { kind: 'refusal', text: 'nope' },
      ])
    )
  })

  it('returns parse_error on invalid JSON', () => {
    expect(parseSseData('not-json')).toEqual([
      { kind: 'parse_error', raw: 'not-json' },
    ])
  })
})

describe('tool call accumulation', () => {
  it('merges fragmented tool_call argument streams', () => {
    const acc: ToolCallAccumulator = new Map()
    const deltas = [
      {
        kind: 'tool_call_delta' as const,
        index: 0,
        id: 'call_1',
        name: 'fn',
        arguments: '{"a":',
      },
      {
        kind: 'tool_call_delta' as const,
        index: 0,
        arguments: '1}',
      },
    ]
    for (const d of deltas) applyToolCallDelta(acc, d)
    expect(finalizeToolCalls(acc)).toEqual([
      {
        id: 'call_1',
        type: 'function',
        function: { name: 'fn', arguments: '{"a":1}' },
      },
    ])
  })
})
