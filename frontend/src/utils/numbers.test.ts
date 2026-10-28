import { describe, expect, it } from 'vitest'
import { formatNumber, parseNumber } from './numbers'

describe('parseNumber', () => {
  it.each([
    ['12', 12],
    ['-7', -7],
    ['3.5', 3.5],
    ['3,5', 3.5],
    ['-0,25', -0.25],
    ['.5', 0.5],
    ['  42  ', 42],
  ])('convierte "%s" en %s', (input, expected) => {
    expect(parseNumber(input)).toEqual({ ok: true, value: expected })
  })

  it('marca como obligatorio un campo vacío', () => {
    expect(parseNumber('   ')).toEqual({ ok: false, error: 'Este campo es obligatorio' })
  })

  it.each(['abc', '1.2.3', '--5', '5-', '1e5', '1 000', '3,', '12abc'])('rechaza "%s"', (input) => {
    const result = parseNumber(input)

    expect(result.ok).toBe(false)
  })

  it('rechaza números que no entran en un double', () => {
    expect(parseNumber('9'.repeat(400))).toEqual({ ok: false, error: 'El número es demasiado grande' })
  })
})

describe('formatNumber', () => {
  it('muestra los enteros tal cual', () => {
    expect(formatNumber(42)).toBe('42')
    expect(formatNumber(-1000)).toBe('-1000')
  })

  it('esconde los errores de punto flotante', () => {
    expect(formatNumber(0.1 + 0.2)).toBe('0.3')
  })

  it('redondea los decimales a 12 cifras significativas', () => {
    expect(formatNumber(1 / 3)).toBe('0.333333333333')
    expect(formatNumber(Math.SQRT2)).toBe('1.41421356237')
  })

  it('no muestra -0', () => {
    expect(formatNumber(-0)).toBe('0')
  })
})
