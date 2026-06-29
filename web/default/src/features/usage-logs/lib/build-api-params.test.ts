/*
Copyright (C) 2023-2026 QuantumNous
*/
import { describe, expect, it } from 'vitest'
import { buildApiParams } from './utils'

describe('buildApiParams', () => {
  it('includes admin channel and username from search params', () => {
    const params = buildApiParams({
      page: 2,
      pageSize: 50,
      searchParams: {
        channel: '42',
        username: 'root',
        model: 'gpt-5.4-mini',
        startTime: 1_700_000_000_000,
        endTime: 1_700_086_400_000,
      },
      columnFilters: [],
      isAdmin: true,
    })

    expect(params.p).toBe(2)
    expect(params.page_size).toBe(50)
    expect(params.channel).toBe(42)
    expect(params.username).toBe('root')
    expect(params.model_name).toBe('gpt-5.4-mini')
    expect(params.start_timestamp).toBeDefined()
    expect(params.end_timestamp).toBeDefined()
  })

  it('omits username and channel for non-admin', () => {
    const params = buildApiParams({
      page: 1,
      pageSize: 20,
      searchParams: { channel: '1', username: 'x' },
      columnFilters: [],
      isAdmin: false,
    })

    expect(params.channel).toBeUndefined()
    expect(params.username).toBeUndefined()
  })

  it('maps type from URL search params', () => {
    const params = buildApiParams({
      page: 1,
      pageSize: 100,
      searchParams: { type: ['5'] },
      columnFilters: [],
      isAdmin: true,
    })

    expect(params.type).toBe(5)
  })

  it('applies default time range when search has no times', () => {
    const params = buildApiParams({
      page: 1,
      pageSize: 100,
      searchParams: {},
      columnFilters: [],
      isAdmin: true,
    })

    expect(params.start_timestamp).toBeTypeOf('number')
    expect(params.end_timestamp).toBeTypeOf('number')
    expect((params.end_timestamp ?? 0) >= (params.start_timestamp ?? 0)).toBe(
      true
    )
  })
})
