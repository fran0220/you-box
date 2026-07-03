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
// Route guards import this file before the page chunk is loaded, so keep it
// data-only. Do not import section registries or settings components here;
// those registries intentionally live inside the lazy-loaded page chunks.
export const SETTINGS_SECTION_ROUTES = {
  site: {
    defaultSection: 'system-info',
    sectionIds: [
      'system-info',
      'notice',
      'header-navigation',
      'sidebar-modules',
    ],
  },
  auth: {
    defaultSection: 'basic-auth',
    sectionIds: [
      'basic-auth',
      'oauth',
      'passkey',
      'bot-protection',
      'custom-oauth',
    ],
  },
  billing: {
    defaultSection: 'quota',
    sectionIds: [
      'quota',
      'currency',
      'model-pricing',
      'group-pricing',
      'payment',
      'checkin',
    ],
  },
  models: {
    defaultSection: 'global',
    sectionIds: [
      'global',
      'gemini',
      'claude',
      'grok',
      'channel-affinity',
      'model-deployment',
    ],
  },
  security: {
    defaultSection: 'rate-limit',
    sectionIds: ['rate-limit', 'sensitive-words', 'ssrf'],
  },
  content: {
    defaultSection: 'dashboard',
    sectionIds: [
      'dashboard',
      'announcements',
      'api-info',
      'uptime-kuma',
      'chat',
      'drawing',
    ],
  },
  operations: {
    defaultSection: 'behavior',
    sectionIds: [
      'behavior',
      'monitoring',
      'email',
      'worker',
      'logs',
      'performance',
      'update-checker',
    ],
  },
} as const

export type SettingsRouteGroup = keyof typeof SETTINGS_SECTION_ROUTES

export function isSettingsSectionId(
  group: SettingsRouteGroup,
  section: string
): boolean {
  return (
    SETTINGS_SECTION_ROUTES[group].sectionIds as readonly string[]
  ).includes(section)
}
