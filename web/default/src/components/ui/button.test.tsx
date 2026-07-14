/*
Copyright (C) 2023-2026 QuantumNous
*/
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  test('primary variant renders and loading disables interaction', () => {
    render(<Button loading>Save</Button>)
    const btn = screen.getByRole('button', { name: /Save/ })
    expect(btn).toBeDisabled()
    expect(btn).toHaveClass('bg-brand')
  })
})
