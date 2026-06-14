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
import type { ReactNode } from 'react'
import { Outlet, useRouterState } from '@tanstack/react-router'
import { m, useReducedMotion, type Variants } from 'motion/react'
import {
  CARD_ITEM_VARIANTS,
  CARD_STAGGER_VARIANTS,
  MOTION_TRANSITION,
  MOTION_VARIANTS,
  STAGGER_ITEM_VARIANTS,
  STAGGER_VARIANTS,
  TABLE_ROW_VARIANTS,
  TABLE_STAGGER_VARIANTS,
} from '@/lib/motion'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition(props: PageTransitionProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={props.className}>{props.children}</div>
  }

  return (
    <m.div
      initial={MOTION_VARIANTS.pageEnter.initial}
      animate={MOTION_VARIANTS.pageEnter.animate}
      transition={MOTION_TRANSITION.default}
      className={props.className}
    >
      {props.children}
    </m.div>
  )
}

export function AnimatedOutlet() {
  const shouldReduce = useReducedMotion()
  const routeKey = useRouterState({
    select: (s) => s.location.pathname,
  })

  if (shouldReduce) {
    return (
      <div className='flex min-h-0 flex-1 flex-col'>
        <Outlet />
      </div>
    )
  }

  return (
    <m.div
      key={routeKey}
      initial={MOTION_VARIANTS.pageEnter.initial}
      animate={MOTION_VARIANTS.pageEnter.animate}
      transition={MOTION_TRANSITION.fast}
      className='flex min-h-0 flex-1 flex-col'
    >
      <Outlet />
    </m.div>
  )
}

interface StaggerContainerProps {
  children: ReactNode
  className?: string
  variants?: Variants
}

export function StaggerContainer(props: StaggerContainerProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={props.className}>{props.children}</div>
  }

  return (
    <m.div
      variants={props.variants ?? STAGGER_VARIANTS}
      initial='initial'
      animate='animate'
      className={props.className}
    >
      {props.children}
    </m.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
  variants?: Variants
}

export function StaggerItem(props: StaggerItemProps) {
  return (
    <m.div
      variants={props.variants ?? STAGGER_ITEM_VARIANTS}
      className={props.className}
    >
      {props.children}
    </m.div>
  )
}

export function TableStaggerContainer(props: StaggerContainerProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <>{props.children}</>
  }

  return (
    <m.tbody
      variants={TABLE_STAGGER_VARIANTS}
      initial='initial'
      animate='animate'
      className={props.className}
    >
      {props.children}
    </m.tbody>
  )
}

export function TableStaggerRow(props: StaggerItemProps) {
  return (
    <m.tr variants={TABLE_ROW_VARIANTS} className={props.className}>
      {props.children}
    </m.tr>
  )
}

export function CardStaggerContainer(props: StaggerContainerProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={props.className}>{props.children}</div>
  }

  return (
    <m.div
      variants={CARD_STAGGER_VARIANTS}
      initial='initial'
      animate='animate'
      className={props.className}
    >
      {props.children}
    </m.div>
  )
}

export function CardStaggerItem(props: StaggerItemProps) {
  return (
    <m.div variants={CARD_ITEM_VARIANTS} className={props.className}>
      {props.children}
    </m.div>
  )
}

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeIn(props: FadeInProps) {
  const shouldReduce = useReducedMotion()

  if (shouldReduce) {
    return <div className={props.className}>{props.children}</div>
  }

  return (
    <m.div
      initial={MOTION_VARIANTS.fadeIn.initial}
      animate={MOTION_VARIANTS.fadeIn.animate}
      transition={{
        ...MOTION_TRANSITION.default,
        delay: props.delay,
      }}
      className={props.className}
    >
      {props.children}
    </m.div>
  )
}
