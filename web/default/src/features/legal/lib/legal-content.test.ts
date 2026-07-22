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
