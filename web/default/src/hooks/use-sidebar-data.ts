import {
  Activity,
  FileText,
  Key,
  ShieldCheck,
  SlidersHorizontal,
  Wallet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type SidebarData } from '@/components/layout/types'

/**
 * Root navigation groups for the application sidebar.
 *
 * Converged user console: a single flat group of six high-frequency
 * entries (Amp-style restraint). Public resources (docs, pricing,
 * apps) live in the header, not here. Admins additionally get a
 * single role-gated entry into the admin drill-in workspace.
 *
 * These are shown when the URL does not match any nested sidebar view
 * registered in `layout/lib/sidebar-view-registry.ts`.
 */
export function useSidebarData(): SidebarData {
  const { t } = useTranslation()

  return {
    navGroups: [
      {
        id: 'console',
        title: '',
        items: [
          {
            title: t('Overview'),
            url: '/dashboard/overview',
            icon: Activity,
          },
          {
            title: t('API Keys'),
            url: '/keys',
            icon: Key,
          },
          {
            title: t('Usage'),
            url: '/usage-logs/common',
            activeUrls: ['/usage-logs/task', '/usage-logs/drawing'],
            configUrls: ['/usage-logs/common', '/usage-logs/task'],
            icon: FileText,
          },
          {
            title: t('Billing'),
            url: '/wallet',
            icon: Wallet,
          },
          {
            title: t('Settings'),
            url: '/profile',
            icon: SlidersHorizontal,
          },
        ],
      },
      {
        id: 'admin',
        title: '',
        items: [
          {
            title: t('Admin console'),
            url: '/channels',
            configUrls: [
              '/channels',
              '/models',
              '/users',
              '/redemption-codes',
              '/subscriptions',
              '/system-info',
              '/system-settings',
            ],
            icon: ShieldCheck,
          },
        ],
      },
    ],
  }
}
