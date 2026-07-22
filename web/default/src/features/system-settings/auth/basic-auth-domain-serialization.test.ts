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
