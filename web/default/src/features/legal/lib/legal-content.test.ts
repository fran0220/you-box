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
import {
  extractMarkdownToc,
  isLikelyLegalHtml,
  isValidLegalUrl,
} from './legal-content'

describe('isValidLegalUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isValidLegalUrl('https://example.com/legal')).toBe(true)
    expect(isValidLegalUrl('http://localhost/doc')).toBe(true)
  })

  it('rejects non-URLs and unsafe schemes', () => {
    expect(isValidLegalUrl('plain text')).toBe(false)
    expect(isValidLegalUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('isLikelyLegalHtml', () => {
  it('detects HTML tags', () => {
    expect(isLikelyLegalHtml('<p>Terms</p>')).toBe(true)
    expect(isLikelyLegalHtml('## Markdown only')).toBe(false)
  })
})

describe('extractMarkdownToc', () => {
  it('collects h2 and h3 with slugs and skips code fences', () => {
    const md = `
\`\`\`js
## not a heading
\`\`\`
## Overview
### Data we process
## Contact
`
    const toc = extractMarkdownToc(md)
    expect(toc).toHaveLength(3)
    expect(toc[0]).toMatchObject({ text: 'Overview', level: 2 })
    expect(toc[1]).toMatchObject({ text: 'Data we process', level: 3 })
    expect(toc[0].id).toBeTruthy()
    expect(toc[0].id).toBe(toc[0].id.toLowerCase())
  })

  it('strips link syntax from heading text', () => {
    const toc = extractMarkdownToc('## [Privacy](https://x.test)')
    expect(toc[0].text).toBe('Privacy')
  })
})
