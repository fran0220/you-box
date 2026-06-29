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
