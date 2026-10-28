import { describe, expect, it } from 'vitest'
import { describeOperation, OPERATION_IDS, OPERATIONS, type Operation } from './operations'

describe('describeOperation', () => {
  it.each<[Operation, number, number, string]>([
    ['add', 2, 3, '2 + 3'],
    ['subtract', 10, 4, '10 − 4'],
    ['multiply', 6, 7, '6 × 7'],
    ['divide', 12, 4, '12 ÷ 4'],
    ['power', 2, 8, '2^8'],
    ['percentage', 20, 150, '20% de 150'],
  ])('%s(%s, %s) se muestra como "%s"', (operation, a, b, expected) => {
    expect(describeOperation(operation, a, b)).toBe(expected)
  })

  it('la raíz cuadrada solo muestra A', () => {
    expect(describeOperation('sqrt', 16)).toBe('√16')
  })

  it('pone los números negativos entre paréntesis', () => {
    expect(describeOperation('subtract', 5, -3)).toBe('5 − (-3)')
    expect(describeOperation('power', -2, 2)).toBe('(-2)^2')
  })

  it('formatea los decimales', () => {
    expect(describeOperation('add', 0.1, 0.2)).toBe('0.1 + 0.2')
  })
})

describe('OPERATIONS', () => {
  it('tiene las 7 operaciones del backend en orden', () => {
    expect(OPERATION_IDS).toEqual(['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'percentage'])
  })

  it('solo la raíz cuadrada usa un único número', () => {
    const unary = OPERATION_IDS.filter((id) => OPERATIONS[id].unary)

    expect(unary).toEqual(['sqrt'])
  })
})
