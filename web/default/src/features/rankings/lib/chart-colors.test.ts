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
