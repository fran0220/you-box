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
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'

function Switch({
  className,
  size = 'default',
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: 'sm' | 'default'
}) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      data-size={size}
      className={cn(
        'peer group/switch data-unchecked:border-border-strong data-unchecked:bg-surface-3 data-checked:border-transparent data-checked:bg-primary duration-base relative inline-flex h-[23px] w-10 shrink-0 items-center rounded-full border transition-[background-color,border-color,box-shadow] ease-out outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:shadow-[var(--ring)] aria-invalid:border-destructive data-disabled:cursor-not-allowed data-disabled:opacity-40 data-[size=sm]:h-[18px] data-[size=sm]:w-8',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot='switch-thumb'
        className='bg-[var(--ink-200)] shadow-xs data-checked:bg-primary-foreground pointer-events-none block size-[17px] rounded-full ring-0 transition-transform duration-base ease-spring group-data-[size=sm]/switch:size-3.5 group-data-[size=default]/switch:data-checked:translate-x-[17px] group-data-[size=sm]/switch:data-checked:translate-x-[14px] group-data-[size=default]/switch:data-unchecked:translate-x-0.5 group-data-[size=sm]/switch:data-unchecked:translate-x-0.5'
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
