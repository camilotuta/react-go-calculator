import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeResponse } from '../test/fakeResponse'
import { ApiError, calculate } from './calculatorApi'

describe('calculate', () => {
  const fetchMock = vi.fn<typeof fetch>()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('hace un POST al endpoint de la operación y devuelve el resultado', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, { operation: 'divide', a: 10, b: 4, result: 2.5 }))

    await expect(calculate('divide', 10, 4)).resolves.toBe(2.5)
    expect(fetchMock).toHaveBeenCalledWith('/api/divide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a: 10, b: 4 }),
    })
  })

  it('para la raíz cuadrada solo manda a', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, { result: 4 }))

    await calculate('sqrt', 16)

    const options = fetchMock.mock.calls[0][1]
    expect(options?.body).toBe(JSON.stringify({ a: 16 }))
  })

  it('lanza un ApiError con el mensaje y el status que devuelve el backend', async () => {
    fetchMock.mockResolvedValue(fakeResponse(422, { error: 'no se puede dividir entre cero' }))

    const error = await calculate('divide', 1, 0).catch((err: unknown) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ message: 'no se puede dividir entre cero', status: 422 })
  })

  it('usa un mensaje genérico si el error no viene en JSON', async () => {
    fetchMock.mockResolvedValue(fakeResponse(500))

    await expect(calculate('add', 1, 2)).rejects.toThrow('El servidor respondió con un error (500)')
  })

  it('avisa cuando no se puede conectar con el backend', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(calculate('add', 1, 2)).rejects.toThrow('No se pudo conectar con el servidor')
  })

  it.each([502, 503, 504])('un %s del proxy se muestra como error de conexión', async (status) => {
    fetchMock.mockResolvedValue(fakeResponse(status))

    await expect(calculate('add', 1, 2)).rejects.toThrow('No se pudo conectar con el servidor')
  })

  it('falla si la respuesta no trae el resultado', async () => {
    fetchMock.mockResolvedValue(fakeResponse(200, { status: 'ok' }))

    await expect(calculate('add', 1, 2)).rejects.toThrow('La respuesta del servidor no tiene el formato esperado')
  })
})
