import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import type { EnrichedPricingModel, TokenUnit } from '../types'
import { ModelCard } from './model-card'

export interface ModelGridProps {
  models: EnrichedPricingModel[]
  priceRate?: number
  usdExchangeRate?: number
  tokenUnit?: TokenUnit
  showRechargePrice?: boolean
}

// Estimated card-row height (px). Rows self-measure via `measureElement`,
// so the estimate only seeds the initial layout.
const ESTIMATED_ROW_HEIGHT = 224
const ROW_GAP = 16

function columnsForWidth(width: number): number {
  if (width >= 1024) return 3
  if (width >= 620) return 2
  return 1
}

/**
 * Window-virtualized card grid: the full client-side catalog is chunked into
 * rows of N cards (N tracks container width) and only the visible rows mount.
 * No pagination — scrolling feels infinite, like the dense list it replaces.
 */
export function ModelGrid(props: ModelGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [columns, setColumns] = useState(3)
  // The window virtualizer needs the grid's distance from the document top so
  // its absolute offsets line up with window scroll. Measured after layout
  // (and whenever body layout shifts) rather than read during render.
  const [scrollMargin, setScrollMargin] = useState(0)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => {
      setScrollMargin(el.getBoundingClientRect().top + window.scrollY)
      setColumns(columnsForWidth(el.clientWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    // The control strip above the grid grows/shrinks at runtime (filter pills
    // appearing/disappearing) WITHOUT firing a window resize, which would
    // leave scrollMargin stale and misalign the absolutely-positioned rows.
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    ro.observe(el)
    return () => {
      window.removeEventListener('resize', measure)
      ro.disconnect()
    }
  }, [])

  const rows = useMemo(() => {
    const chunks: EnrichedPricingModel[][] = []
    for (let i = 0; i < props.models.length; i += columns) {
      chunks.push(props.models.slice(i, i + columns))
    }
    return chunks
  }, [props.models, columns])

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ESTIMATED_ROW_HEIGHT,
    overscan: 4,
    scrollMargin,
  })

  const items = virtualizer.getVirtualItems()

  return (
    <div ref={containerRef}>
      <div className='relative' style={{ height: virtualizer.getTotalSize() }}>
        {items.map((item) => (
          <div
            key={item.key}
            ref={virtualizer.measureElement}
            data-index={item.index}
            className='absolute top-0 left-0 grid w-full'
            style={{
              transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: ROW_GAP,
              paddingBottom: ROW_GAP,
            }}
          >
            {rows[item.index]?.map((model) => (
              <ModelCard
                key={model.model_name}
                model={model}
                priceRate={props.priceRate}
                usdExchangeRate={props.usdExchangeRate}
                tokenUnit={props.tokenUnit}
                showRechargePrice={props.showRechargePrice}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
