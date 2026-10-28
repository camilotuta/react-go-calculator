import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResultDisplay } from './ResultDisplay'

describe('ResultDisplay', () => {
  it('al inicio muestra 0 y una ayuda', () => {
    render(<ResultDisplay display={{ status: 'idle' }} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/elige una operación/i)).toBeInTheDocument()
  })

  it('mientras carga muestra la operación', () => {
    render(<ResultDisplay display={{ status: 'loading', expression: '2 + 2' }} />)

    expect(screen.getByText('2 + 2')).toBeInTheDocument()
    expect(screen.getByText('Calculando...')).toBeInTheDocument()
  })

  it('muestra el resultado formateado', () => {
    render(<ResultDisplay display={{ status: 'success', expression: '0.1 + 0.2', result: 0.30000000000000004 }} />)

    expect(screen.getByText('0.1 + 0.2 =')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('0.3')
  })

  it('muestra el error como alerta', () => {
    render(<ResultDisplay display={{ status: 'error', expression: '1 ÷ 0', message: 'no se puede dividir entre cero' }} />)

    expect(screen.getByRole('alert')).toHaveTextContent('no se puede dividir entre cero')
  })
})
