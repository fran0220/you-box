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
import { describe, expect, it } from 'vitest'
import { buildMonochromeSeriesColorMap } from './chart-colors'

describe('buildMonochromeSeriesColorMap', () => {
  it('assigns stable colors per series name', () => {
    const map = buildMonochromeSeriesColorMap(['OpenAI', 'Anthropic'], {
      chart1: '#111',
      chart2: '#222',
      chart3: '#333',
      chart4: '#444',
      chart5: '#555',
      mutedForeground: '#666',
    })
    expect(map.OpenAI).toBe('#111')
    expect(map.Anthropic).toBe('#222')
  })

  it('cycles palette when there are more names than colors', () => {
    const map = buildMonochromeSeriesColorMap(['a', 'b', 'c'], {
      chart1: '#111',
      chart2: '#222',
      chart3: '',
      chart4: '',
      chart5: '',
      mutedForeground: '',
    })
    expect(map.c).toBe('#111')
  })
})
