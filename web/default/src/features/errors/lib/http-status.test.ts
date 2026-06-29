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
import { describe, expect, it } from 'vitest'
import { getHttpStatus } from './http-status'

describe('getHttpStatus', () => {
  it('returns undefined for non-object errors', () => {
    expect(getHttpStatus(null)).toBeUndefined()
    expect(getHttpStatus('err')).toBeUndefined()
  })

  it('extracts numeric status from axios-like error shape', () => {
    expect(getHttpStatus({ response: { status: 429 } })).toBe(429)
    expect(getHttpStatus({ response: { status: 502 } })).toBe(502)
  })

  it('returns undefined when response or status is missing', () => {
    expect(getHttpStatus({})).toBeUndefined()
    expect(getHttpStatus({ response: {} })).toBeUndefined()
    expect(getHttpStatus({ response: { status: '500' } })).toBeUndefined()
  })
})
