/*
Copyright (C) 2023-2026 QuantumNous
*/
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { Switch } from './switch'

describe('Switch', () => {
  test('toggles checked state on click', async () => {
    const user = userEvent.setup()
    render(<Switch defaultChecked={false} aria-label='Lab switch' />)
    const control = screen.getByRole('switch', { name: 'Lab switch' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    await user.click(control)
    expect(control).toHaveAttribute('aria-checked', 'true')
    await user.click(control)
    expect(control).toHaveAttribute('aria-checked', 'false')
  })
})
