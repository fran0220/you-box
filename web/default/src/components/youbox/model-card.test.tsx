/*
Copyright (C) 2023-2026 QuantumNous
*/
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { ModelCard } from './model-card'

describe('ModelCard', () => {
  test('activates onClick with Enter and Space when interactive', () => {
    const onClick = vi.fn()
    render(
      <ModelCard name='test-model' onClick={onClick} data-testid='model-card' />
    )
    const card = screen.getByTestId('model-card')
    expect(card).toHaveAttribute('role', 'button')
    expect(card).toHaveAttribute('tabindex', '0')

    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(card, { key: ' ' })
    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
