/*
Copyright (C) 2023-2026 QuantumNous
*/
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
  test('toggles checked state on click', () => {
    render(<Checkbox defaultChecked={false} aria-label='Lab checkbox' />)
    const control = screen.getByRole('checkbox', { name: 'Lab checkbox' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(control)
    expect(control).toHaveAttribute('aria-checked', 'true')
  })
})
