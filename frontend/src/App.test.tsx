import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { fakeResponse } from './test/fakeResponse'

// Test de integración: todo real menos fetch, que simula al backend
describe('App', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  async function calculateWithForm(a: string, operation: string, b: string) {
    const user = userEvent.setup()
    await user.type(screen.getByLabelText(/número a/i), a)
    await user.click(screen.getByRole('radio', { name: operation }))
    await user.type(screen.getByLabelText(/número b/i), b)
    await user.click(screen.getByRole('button', { name: /calcular/i }))
    return user
  }

  it('calcula usando la API y muestra el resultado y el historial', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, { operation: 'multiply', a: 6, b: 7, result: 42 }))
    render(<App />)

    await calculateWithForm('6', 'Multiplicación', '7')

    expect(await screen.findByRole('status')).toHaveTextContent('42')
    expect(fetchMock).toHaveBeenCalledWith('/api/multiply', expect.objectContaining({ method: 'POST' }))

    const history = screen.getByRole('list')
    expect(within(history).getByText('6 × 7 =')).toBeInTheDocument()
    expect(within(history).getByText('42')).toBeInTheDocument()
  })

  it('muestra el error que devuelve el backend', async () => {
    fetchMock.mockResolvedValue(fakeResponse(422, { error: 'no se puede dividir entre cero' }))
    render(<App />)

    await calculateWithForm('5', 'División', '0')

    expect(await screen.findByRole('alert')).toHaveTextContent('no se puede dividir entre cero')
    expect(screen.getByText('Todavía no hay operaciones.')).toBeInTheDocument()
  })

  it('Limpiar vuelve la pantalla a 0 y Borrar vacía el historial', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, { result: 3 }))
    render(<App />)

    const user = await calculateWithForm('1', 'Suma', '2')
    await screen.findByRole('status')

    await user.click(screen.getByRole('button', { name: 'Limpiar' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Borrar' }))
    expect(screen.getByText('Todavía no hay operaciones.')).toBeInTheDocument()
  })
})
