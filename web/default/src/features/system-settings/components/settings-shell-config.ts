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
import {
  Box,
  CreditCard,
  Layout,
  Settings,
  Shield,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import {
  AUTH_DEFAULT_SECTION,
  AUTH_SECTION_IDS,
  getAuthSectionMeta,
} from '../auth/section-registry.tsx'
import {
  BILLING_DEFAULT_SECTION,
  BILLING_SECTION_IDS,
  getBillingSectionMeta,
} from '../billing/section-registry.tsx'
import {
  CONTENT_DEFAULT_SECTION,
  CONTENT_SECTION_IDS,
  getContentSectionMeta,
} from '../content/section-registry.tsx'
import {
  MODELS_DEFAULT_SECTION,
  MODELS_SECTION_IDS,
  getModelsSectionMeta,
} from '../models/section-registry.tsx'
import {
  OPERATIONS_DEFAULT_SECTION,
  OPERATIONS_SECTION_IDS,
  getOperationsSectionMeta,
} from '../operations/section-registry.tsx'
import {
  SECURITY_DEFAULT_SECTION,
  SECURITY_SECTION_IDS,
  getSecuritySectionMeta,
} from '../security/section-registry.tsx'
import {
  SITE_DEFAULT_SECTION,
  SITE_SECTION_IDS,
  getSiteSectionMeta,
} from '../site/section-registry.tsx'

export const SETTINGS_SHELL_GROUP_ORDER = [
  'site',
  'auth',
  'billing',
  'models',
  'security',
  'content',
  'operations',
] as const

export type SettingsShellGroup = (typeof SETTINGS_SHELL_GROUP_ORDER)[number]

type ShellGroupRoute =
  | '/system-settings/site/$section'
  | '/system-settings/auth/$section'
  | '/system-settings/billing/$section'
  | '/system-settings/models/$section'
  | '/system-settings/security/$section'
  | '/system-settings/content/$section'
  | '/system-settings/operations/$section'

export type ShellGroupConfig = {
  /** i18n key; mirrors the global sidebar group labels. */
  labelKey: string
  /** Same icon as the global sidebar config for this group. */
  icon: LucideIcon
  route: ShellGroupRoute
  defaultSection: string
  sections: { id: string; titleKey: string }[]
}

export const SETTINGS_SHELL_GROUPS: Record<SettingsShellGroup, ShellGroupConfig> =
  {
    site: {
      labelKey: 'Site & Branding',
      icon: Settings,
      route: '/system-settings/site/$section',
      defaultSection: SITE_DEFAULT_SECTION,
      sections: SITE_SECTION_IDS.map((id) => ({
        id,
        titleKey: getSiteSectionMeta(id).titleKey,
      })),
    },
    auth: {
      labelKey: 'Authentication',
      icon: Shield,
      route: '/system-settings/auth/$section',
      defaultSection: AUTH_DEFAULT_SECTION,
      sections: AUTH_SECTION_IDS.map((id) => ({
        id,
        titleKey: getAuthSectionMeta(id).titleKey,
      })),
    },
    billing: {
      labelKey: 'Billing & Payment',
      icon: CreditCard,
      route: '/system-settings/billing/$section',
      defaultSection: BILLING_DEFAULT_SECTION,
      sections: BILLING_SECTION_IDS.map((id) => ({
        id,
        titleKey: getBillingSectionMeta(id).titleKey,
      })),
    },
    models: {
      labelKey: 'Models & Routing',
      icon: Box,
      route: '/system-settings/models/$section',
      defaultSection: MODELS_DEFAULT_SECTION,
      sections: MODELS_SECTION_IDS.map((id) => ({
        id,
        titleKey: getModelsSectionMeta(id).titleKey,
      })),
    },
    security: {
      labelKey: 'Security & Limits',
      icon: ShieldAlert,
      route: '/system-settings/security/$section',
      defaultSection: SECURITY_DEFAULT_SECTION,
      sections: SECURITY_SECTION_IDS.map((id) => ({
        id,
        titleKey: getSecuritySectionMeta(id).titleKey,
      })),
    },
    content: {
      labelKey: 'Console Content',
      icon: Layout,
      route: '/system-settings/content/$section',
      defaultSection: CONTENT_DEFAULT_SECTION,
      sections: CONTENT_SECTION_IDS.map((id) => ({
        id,
        titleKey: getContentSectionMeta(id).titleKey,
      })),
    },
    operations: {
      labelKey: 'Operations',
      icon: Wrench,
      route: '/system-settings/operations/$section',
      defaultSection: OPERATIONS_DEFAULT_SECTION,
      sections: OPERATIONS_SECTION_IDS.map((id) => ({
        id,
        titleKey: getOperationsSectionMeta(id).titleKey,
      })),
    },
  }

export function isSettingsShellGroup(
  value: string
): value is SettingsShellGroup {
  return (SETTINGS_SHELL_GROUP_ORDER as readonly string[]).includes(value)
}
