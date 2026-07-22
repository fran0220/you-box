import { lazy, Suspense } from 'react'

type VChartProps = React.ComponentProps<
  (typeof import('@visactor/react-vchart'))['VChart']
>

const VChartImpl = lazy(() =>
  import('@visactor/react-vchart').then((mod) => ({ default: mod.VChart }))
)

export function LazyVChart(props: VChartProps) {
  return (
    <Suspense fallback={null}>
      <VChartImpl {...props} />
    </Suspense>
  )
}
