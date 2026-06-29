/*
Copyright (C) 2023-2026 QuantumNous
*/
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

describe('Tabs', () => {
  test('shows only one tab panel in layout at a time', async () => {
    const user = userEvent.setup()
    render(
      <Tabs defaultValue='a'>
        <TabsList>
          <TabsTrigger value='a'>A</TabsTrigger>
          <TabsTrigger value='b'>B</TabsTrigger>
        </TabsList>
        <TabsContent value='a'>Panel A</TabsContent>
        <TabsContent value='b'>Panel B</TabsContent>
      </Tabs>
    )

    const countVisiblePanels = () => {
      const panels = document.querySelectorAll('[data-slot=tabs-content]')
      let visible = 0
      panels.forEach((el) => {
        const style = window.getComputedStyle(el)
        if (style.display !== 'none' && style.visibility !== 'hidden') {
          visible += 1
        }
      })
      return visible
    }

    expect(screen.getByText('Panel A')).toBeVisible()
    expect(countVisiblePanels()).toBe(1)

    await user.click(screen.getByRole('tab', { name: 'B' }))
    expect(screen.getByText('Panel B')).toBeVisible()
    expect(countVisiblePanels()).toBe(1)

    await user.click(screen.getByRole('tab', { name: 'A' }))
    expect(screen.getByText('Panel A')).toBeVisible()
    expect(countVisiblePanels()).toBe(1)
  })
})
