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
import { useLayoutEffect, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { EnrichedPricingModel, TokenUnit } from '../types'
import { ModelRow } from './model-row'

export interface ModelListProps {
  models: EnrichedPricingModel[]
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

// Estimated row height (px). Rows are slightly taller on mobile (stacked
// prices) but the window virtualizer remeasures actual heights via the
// `measureElement` ref, so the estimate only seeds the initial layout.
const ESTIMATED_ROW_HEIGHT = 96

/**
 * Continuous, window-virtualized list of dense model rows. There is NO
 * pagination — the full client-side catalog is rendered (only the visible
 * window plus an overscan buffer is mounted), so scrolling feels infinite.
 */
export function ModelList(props: ModelListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  // The window virtualizer needs the list's distance from the document top so
  // its absolute offsets line up with window scroll. Measured after layout (and
  // on resize) rather than read during render.
  const [scrollMargin, setScrollMargin] = useState(0)
  useLayoutEffect(() => {
    const el = listRef.current
    if (!el) return
    // Distance from the document top (unambiguous regardless of positioned
    // ancestors), so window-scroll offsets map onto the list correctly.
    const measure = () =>
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY)
    measure()
    window.addEventListener('resize', measure)
    // The sticky control strip above the list grows/shrinks at runtime (filter
    // pills appearing/disappearing, the count line wrapping) WITHOUT firing a
    // window resize, which would leave scrollMargin stale and misalign the
    // absolutely-positioned virtual rows. Observe the document body so any such
    // layout-height change re-measures the list's document-top offset.
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [])

  const virtualizer = useWindowVirtualizer({
    count: props.models.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 8,
    scrollMargin,
  })

  const items = virtualizer.getVirtualItems()

  return (
    // Hairline-divided rows live inside a single bordered surface (each ModelRow
    // carries its own bottom border; the container clips the trailing one).
    <div ref={listRef} className='overflow-hidden rounded-xl border'>
      <div
        className='relative w-full'
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {items.map((virtualItem) => {
          const model = props.models[virtualItem.index]
          return (
            <div
              key={model.id ?? model.model_name}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className='absolute top-0 left-0 w-full'
              style={{
                transform: `translateY(${
                  virtualItem.start - virtualizer.options.scrollMargin
                }px)`,
              }}
            >
              <ModelRow
                model={model}
                priceRate={props.priceRate}
                usdExchangeRate={props.usdExchangeRate}
                tokenUnit={props.tokenUnit}
                showRechargePrice={props.showRechargePrice}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
