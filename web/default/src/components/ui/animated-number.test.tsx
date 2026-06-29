/*
Copyright (C) 2023-2026 QuantumNous
*/
import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { AnimatedNumber } from './animated-number'

describe('AnimatedNumber', () => {
  test('renders formatted final value in the DOM on first paint', () => {
    render(<AnimatedNumber value={12} format={(n) => String(Math.round(n))} />)
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  test('renders zero when value is not finite', () => {
    render(
      <AnimatedNumber value={Number.NaN} format={(n) => String(Math.round(n))} />
    )
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
