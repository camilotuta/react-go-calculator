import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as calculatorApi from '../api/calculatorApi'
import { useCalculator } from './useCalculator'

// Se mockea solo calculate; ApiError queda con la implementación real
vi.mock('../api/calculatorApi', async (importOriginal) => {
  const original = await importOriginal<typeof calculatorApi>()
  return { ...original, calculate: vi.fn() }
})

const calculateMock = vi.mocked(calculatorApi.calculate)

describe('useCalculator', () => {
  beforeEach(() => {
    calculateMock.mockReset()
  })

  it('empieza sin resultado y con el historial vacío', () => {
    const { result } = renderHook(() => useCalculator())

    expect(result.current.display).toEqual({ status: 'idle' })
    expect(result.current.history).toEqual([])
  })

  it('muestra el resultado y lo agrega al historial', async () => {
    calculateMock.mockResolvedValue(5)
    const { result } = renderHook(() => useCalculator())

    await act(() => result.current.calculate('add', 2, 3))

    expect(calculateMock).toHaveBeenCalledWith('add', 2, 3)
    expect(result.current.display).toEqual({ status: 'success', expression: '2 + 3', result: 5 })
    expect(result.current.history).toEqual([{ id: 1, expression: '2 + 3', result: 5 }])
  })

  it('muestra "cargando" mientras espera la respuesta', async () => {
    let resolveRequest: (value: number) => void = () => {}
    calculateMock.mockReturnValue(new Promise((resolve) => (resolveRequest = resolve)))
    const { result } = renderHook(() => useCalculator())

    let pending: Promise<void> = Promise.resolve()
    act(() => {
      pending = result.current.calculate('multiply', 3, 3)
    })

    expect(result.current.display).toEqual({ status: 'loading', expression: '3 × 3' })

    await act(async () => {
      resolveRequest(9)
      await pending
    })

    expect(result.current.display).toEqual({ status: 'success', expression: '3 × 3', result: 9 })
  })

  it('muestra el error del backend y no lo guarda en el historial', async () => {
    calculateMock.mockRejectedValue(new calculatorApi.ApiError('no se puede dividir entre cero', 422))
    const { result } = renderHook(() => useCalculator())

    await act(() => result.current.calculate('divide', 1, 0))

    expect(result.current.display).toEqual({
      status: 'error',
      expression: '1 ÷ 0',
      message: 'no se puede dividir entre cero',
    })
    expect(result.current.history).toEqual([])
  })

  it('usa un mensaje genérico si lo que falla no es un Error', async () => {
    calculateMock.mockRejectedValue('algo raro')
    const { result } = renderHook(() => useCalculator())

    await act(() => result.current.calculate('sqrt', 4))

    expect(result.current.display).toMatchObject({ status: 'error', message: 'Ocurrió un error inesperado' })
  })

  it('guarda como máximo 10 operaciones, la más nueva primero', async () => {
    calculateMock.mockImplementation(async (_operation, a) => a)
    const { result } = renderHook(() => useCalculator())

    for (let i = 1; i <= 12; i++) {
      await act(() => result.current.calculate('add', i, 0))
    }

    expect(result.current.history).toHaveLength(10)
    expect(result.current.history[0].expression).toBe('12 + 0')
    expect(result.current.history[9].expression).toBe('3 + 0')
  })

  it('reset limpia la pantalla y clearHistory borra el historial', async () => {
    calculateMock.mockResolvedValue(1)
    const { result } = renderHook(() => useCalculator())
    await act(() => result.current.calculate('add', 1, 0))

    act(() => result.current.reset())
    expect(result.current.display).toEqual({ status: 'idle' })
    expect(result.current.history).toHaveLength(1)

    act(() => result.current.clearHistory())
    expect(result.current.history).toEqual([])
  })
})
