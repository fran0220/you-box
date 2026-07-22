export type DocsNavItem = {
  id: string
  label: string
  group: string
}

export const DOCS_NAV: DocsNavItem[] = [
  { id: 'overview', label: 'Introduction', group: 'Get started' },
  { id: 'quickstart', label: 'Quickstart', group: 'Get started' },
  { id: 'authentication', label: 'Authentication', group: 'Get started' },
  { id: 'base-url', label: 'Base URL', group: 'API reference' },
  { id: 'chat-completions', label: 'Chat completions', group: 'API reference' },
  { id: 'request-parameters', label: 'Request parameters', group: 'API reference' },
  { id: 'response', label: 'Response', group: 'API reference' },
  { id: 'errors', label: 'Error codes', group: 'API reference' },
  { id: 'request-builder', label: 'Try it', group: 'Guides' },
]

export const DOCS_SECTION_IDS = DOCS_NAV.map((item) => item.id)