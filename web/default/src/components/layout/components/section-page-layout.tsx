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
  Children,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Main } from './main'
import { PageFooterProvider } from './page-footer'

type SlotProps = { children?: ReactNode }

function SectionPageLayoutTitle(_props: SlotProps) {
  return null
}
SectionPageLayoutTitle.displayName = 'SectionPageLayout.Title'

function SectionPageLayoutActions(_props: SlotProps) {
  return null
}
SectionPageLayoutActions.displayName = 'SectionPageLayout.Actions'

function SectionPageLayoutContent(_props: SlotProps) {
  return null
}
SectionPageLayoutContent.displayName = 'SectionPageLayout.Content'

function SectionPageLayoutBreadcrumb(_props: SlotProps) {
  return null
}
SectionPageLayoutBreadcrumb.displayName = 'SectionPageLayout.Breadcrumb'

export type SectionPageLayoutProps = {
  children: ReactNode
}

export function SectionPageLayout(props: SectionPageLayoutProps) {
  const [footerContainer, setFooterContainer] = useState<HTMLDivElement | null>(
    null
  )

  let title: ReactNode = null
  let actions: ReactNode = null
  let content: ReactNode = null
  let breadcrumb: ReactNode = null

  Children.forEach(props.children, (node) => {
    if (!isValidElement(node)) return
    const child = node as ReactElement<SlotProps>
    if (child.type === SectionPageLayoutTitle) title = child.props.children
    else if (child.type === SectionPageLayoutActions)
      actions = child.props.children
    else if (child.type === SectionPageLayoutContent)
      content = child.props.children
    else if (child.type === SectionPageLayoutBreadcrumb)
      breadcrumb = child.props.children
  })

  return (
    <PageFooterProvider container={footerContainer}>
      <Main>
        {(breadcrumb != null || title != null || actions != null) && (
          <div className='mx-auto w-full max-w-[var(--container-lg,1100px)] shrink-0 px-[var(--gutter,24px)] pt-7 pb-4'>
            {breadcrumb != null && (
              <div className='mb-2 sm:mb-3'>{breadcrumb}</div>
            )}
            {(title != null || actions != null) && (
              <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:gap-x-4'>
                {/* min-w keeps the title readable; crowded actions wrap below
                instead of squeezing the heading to a sliver */}
                {title != null ? (
                  <div className='min-w-[min(100%,12rem)] flex-1'>
                    <h2 className='font-display truncate text-lg font-bold tracking-[-0.025em] sm:text-xl'>
                      {title}
                    </h2>
                  </div>
                ) : (
                  <div className='flex-1' />
                )}
                {actions != null && (
                  <div className='flex max-w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-x-4'>
                    {actions}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div
          data-app-content-scroll
          className='mx-auto min-h-0 w-full max-w-[var(--container-lg,1100px)] flex-1 overflow-auto px-[var(--gutter,24px)] pt-1 pb-16'
        >
          {content}
        </div>

        <div
          ref={setFooterContainer}
          className='bg-background mx-auto w-full max-w-[var(--container-lg,1100px)] shrink-0 border-t px-[var(--gutter,24px)] py-3 empty:hidden'
        />
      </Main>
    </PageFooterProvider>
  )
}

SectionPageLayout.Title = SectionPageLayoutTitle
SectionPageLayout.Actions = SectionPageLayoutActions
SectionPageLayout.Content = SectionPageLayoutContent
SectionPageLayout.Breadcrumb = SectionPageLayoutBreadcrumb
