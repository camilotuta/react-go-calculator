// Acepta enteros y decimales, positivos o negativos, con punto o con coma.
// Ejemplos válidos: "12", "-3.5", "0,25", ".5"
const NUMBER_REGEX = /^-?(\d+([.,]\d+)?|[.,]\d+)$/

export type ParseResult = { ok: true; value: number } | { ok: false; error: string }

export function parseNumber(input: string): ParseResult {
  const text = input.trim()

  if (text === '') {
    return { ok: false, error: 'Este campo es obligatorio' }
  }
  if (!NUMBER_REGEX.test(text)) {
    return { ok: false, error: 'Escribe un número válido, por ejemplo 12, -3.5 o 0,25' }
  }

  const value = Number(text.replace(',', '.'))
  if (!Number.isFinite(value)) {
    return { ok: false, error: 'El número es demasiado grande' }
  }
  return { ok: true, value }
}

// Formatea un número para mostrarlo en pantalla. Los decimales se redondean a
// 12 cifras significativas para no mostrar cosas como 0.1 + 0.2 = 0.30000000000000004
export function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString()
  }
  return Number.parseFloat(value.toPrecision(12)).toString()
}
