import { type TFunction } from 'i18next'
import {
  BarChart3,
  CreditCard,
  ListTodo,
  Network,
  Radio,
  ServerCog,
  Settings,
  Ticket,
  Users,
} from 'lucide-react'
import { ROLE } from '@/lib/roles'
import type { NavGroup, SidebarView } from '../types'

function getAdminNavGroups(t: TFunction, userRole?: number): NavGroup[] {
  const rootOnlyItems: NavGroup['items'] =
    userRole === ROLE.SUPER_ADMIN
      ? [
          {
            title: t('System Info'),
            url: '/system-info',
            icon: ServerCog,
          },
          {
            title: t('System Settings'),
            url: '/system-settings/site',
            activeUrls: ['/system-settings'],
            icon: Settings,
          },
        ]
      : []

  return [
    {
      id: 'admin-workspace',
      title: t('Admin'),
      items: [
        {
          title: t('Channels'),
          url: '/channels',
          icon: Radio,
        },
        {
          title: t('Models'),
          url: '/models/metadata',
          activeUrls: ['/models'],
          icon: ListTodo,
        },
        {
          title: t('Users'),
          url: '/users',
          icon: Users,
        },
        {
          title: t('User Analytics'),
          url: '/dashboard/users',
          icon: BarChart3,
        },
        {
          title: t('Traffic Flow'),
          url: '/dashboard/flow',
          icon: Network,
        },
        {
          title: t('Redemption Codes'),
          url: '/redemption-codes',
          icon: Ticket,
        },
        {
          title: t('Subscription Management'),
          url: '/subscriptions',
          icon: CreditCard,
        },
        ...rootOnlyItems,
      ],
    },
  ]
}

/**
 * Admin drill-in workspace: entering any admin surface swaps the
 * sidebar to this contextual view with a "Back to Console"
 * affordance. Regular users never see the entry point and route
 * guards keep direct URLs protected.
 */
export const ADMIN_VIEW: SidebarView = {
  id: 'admin',
  pathPattern:
    /^\/(channels|models|users|redemption-codes|subscriptions|system-info)(\/|$)|^\/dashboard\/(users|flow)(\/|$)/,
  parent: {
    to: '/dashboard/overview',
    label: 'Back to Console',
  },
  getNavGroups: getAdminNavGroups,
}
