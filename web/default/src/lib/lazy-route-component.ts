import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import { LoadingState } from '@/components/loading-state'

type LazyComponentLoader<TProps extends object> = () => Promise<{
  default: ComponentType<TProps>
}>

export function createLazyComponent<TProps extends object>(
  load: LazyComponentLoader<TProps>
): (props: TProps) => ReactElement {
  const Component = lazy(load)

  function LazyComponent(props: TProps): ReactElement {
    return createElement(
      Suspense,
      { fallback: createElement(LoadingState) },
      createElement(Component, props)
    )
  }

  return LazyComponent
}

export function createLazyRouteComponent(
  load: LazyComponentLoader<Record<string, never>>
): () => ReactElement {
  const Component = createLazyComponent(load)

  function LazyRouteComponent(): ReactElement {
    return createElement(Component, {})
  }

  return LazyRouteComponent
}
