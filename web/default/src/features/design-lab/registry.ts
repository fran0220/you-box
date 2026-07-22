import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type DesignLabGroup = {
  id: string
  title: string
  component: LazyExoticComponent<ComponentType>
}

/**
 * Design Lab group registry. Each Phase A step registers its demo module
 * here; the gallery shell renders every group as an anchored section.
 * Dev-only: this module is only reachable behind import.meta.env.DEV.
 */
export const DESIGN_LAB_GROUPS: DesignLabGroup[] = [
  {
    id: 'foundations',
    title: 'Foundations',
    component: lazy(() => import('./demos/foundations')),
  },
  {
    id: 'ui-primitives',
    title: 'UI primitives',
    component: lazy(() => import('./demos/ui-primitives')),
  },
  {
    id: 'youbox-compositions',
    title: 'youbox compositions',
    component: lazy(() => import('./demos/youbox-compositions')),
  },
  {
    id: 'data-display',
    title: 'Data display',
    component: lazy(() => import('./demos/data-display')),
  },
  {
    id: 'table',
    title: 'Table v2',
    component: lazy(() => import('./demos/table')),
  },
  {
    id: 'settings-forms',
    title: 'Settings & forms',
    component: lazy(() => import('./demos/settings-forms')),
  },
  {
    id: 'feedback',
    title: 'Feedback & status',
    component: lazy(() => import('./demos/feedback')),
  },
  {
    id: 'ai-code',
    title: 'AI & code',
    component: lazy(() => import('./demos/ai-code')),
  },
]
