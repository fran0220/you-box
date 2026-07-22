import { slugifyHeading } from '@/lib/utils'

export type LegalTocEntry = {
  id: string
  text: string
  level: 2 | 3
}

export function isValidLegalUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isLikelyLegalHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

/** Extract h2/h3 headings from raw Markdown for the sticky TOC rail. */
export function extractMarkdownToc(markdown: string): LegalTocEntry[] {
  const entries: LegalTocEntry[] = []
  let inFence = false
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue
    const text = match[2]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .trim()
    if (!text) continue
    entries.push({
      id: slugifyHeading(text),
      text,
      level: match[1].length as 2 | 3,
    })
  }
  return entries
}
