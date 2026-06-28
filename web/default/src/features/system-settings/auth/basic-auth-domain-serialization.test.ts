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

function domainsFromApi(csv: string): string {
  return csv
    .split(',')
    .map((domain) => domain.trim())
    .filter(Boolean)
    .join('\n')
}

function domainsToApi(text: string): string {
  return text
    .split('\n')
    .map((domain) => domain.trim())
    .filter(Boolean)
    .join(',')
}

describe('basic auth email domain whitelist serialization', () => {
  it('round-trips API csv and textarea lines', () => {
    const api = 'example.com, company.com,test.org'
    const textarea = domainsFromApi(api)
    expect(textarea).toBe('example.com\ncompany.com\ntest.org')
    expect(domainsToApi(textarea)).toBe('example.com,company.com,test.org')
  })

  it('drops blank lines and trims whitespace', () => {
    const textarea = '  a.com  \n\n\nb.com  '
    expect(domainsToApi(textarea)).toBe('a.com,b.com')
  })
})
