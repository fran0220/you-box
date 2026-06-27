/*
Copyright (C) 2023-2026 QuantumNous
*/
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  test('toggles checked state on click', async () => {
    const user = userEvent.setup()
    render(<Checkbox defaultChecked={false} aria-label='Lab checkbox' />)
    const control = screen.getByRole('checkbox', { name: 'Lab checkbox' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    await user.click(control)
    expect(control).toHaveAttribute('aria-checked', 'true')
  })
})
