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
