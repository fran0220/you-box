
export function isValidAboutUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isLikelyAboutHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value)
}

export type AboutContentMode = 'empty' | 'url' | 'html' | 'markdown'

export function resolveAboutContentMode(raw: string): AboutContentMode {
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return 'empty'
  }
  if (isValidAboutUrl(trimmed)) {
    return 'url'
  }
  if (isLikelyAboutHtml(trimmed)) {
    return 'html'
  }
  return 'markdown'
}
