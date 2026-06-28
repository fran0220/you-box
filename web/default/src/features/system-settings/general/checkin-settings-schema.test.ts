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
import * as z from 'zod'
import { describe, expect, it } from 'vitest'

const createCheckinSchema = (t: (key: string) => string) =>
  z
    .object({
      enabled: z.boolean(),
      minQuota: z.coerce.number().int().min(0),
      maxQuota: z.coerce.number().int().min(0),
    })
    .superRefine((data, ctx) => {
      if (data.enabled && data.minQuota > data.maxQuota) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['maxQuota'],
          message: t('Maximum quota must be greater than or equal to minimum'),
        })
      }
    })

describe('checkin settings schema', () => {
  const schema = createCheckinSchema((key) => key)

  it('accepts min less than or equal to max when enabled', () => {
    const result = schema.safeParse({
      enabled: true,
      minQuota: 1000,
      maxQuota: 10000,
    })
    expect(result.success).toBe(true)
  })

  it('rejects min greater than max when enabled', () => {
    const result = schema.safeParse({
      enabled: true,
      minQuota: 20000,
      maxQuota: 1000,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['maxQuota'])
    }
  })

  it('allows min greater than max when check-in is disabled', () => {
    const result = schema.safeParse({
      enabled: false,
      minQuota: 20000,
      maxQuota: 1000,
    })
    expect(result.success).toBe(true)
  })
})
