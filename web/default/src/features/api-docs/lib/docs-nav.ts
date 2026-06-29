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