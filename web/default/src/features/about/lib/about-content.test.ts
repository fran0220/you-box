import { describe, expect, it } from 'vitest'
import {
  isLikelyAboutHtml,
  isValidAboutUrl,
  resolveAboutContentMode,
} from './about-content'

describe('isValidAboutUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isValidAboutUrl('https://example.com/about')).toBe(true)
    expect(isValidAboutUrl('http://localhost/page')).toBe(true)
  })

  it('rejects non-URLs and unsafe schemes', () => {
    expect(isValidAboutUrl('not a url')).toBe(false)
    expect(isValidAboutUrl('javascript:alert(1)')).toBe(false)
    expect(isValidAboutUrl('<p>hello</p>')).toBe(false)
  })
})

describe('isLikelyAboutHtml', () => {
  it('detects HTML tags', () => {
    expect(isLikelyAboutHtml('<p>About us</p>')).toBe(true)
    expect(isLikelyAboutHtml('## Markdown only')).toBe(false)
  })
})

describe('resolveAboutContentMode', () => {
  it('classifies empty, url, html, and markdown', () => {
    expect(resolveAboutContentMode('')).toBe('empty')
    expect(resolveAboutContentMode('  ')).toBe('empty')
    expect(resolveAboutContentMode('https://x.com')).toBe('url')
    expect(resolveAboutContentMode('<h1>Hi</h1>')).toBe('html')
    expect(resolveAboutContentMode('# Hello')).toBe('markdown')
  })
})
