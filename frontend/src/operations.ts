import { formatNumber } from './utils/numbers'

// Tiene que coincidir con las rutas del backend: POST /api/{operation}
export type Operation = 'add' | 'subtract' | 'multiply' | 'divide' | 'power' | 'sqrt' | 'percentage'

export interface OperationInfo {
  symbol: string
  label: string
  hint: string
  // true si la operación solo usa el número A
  unary: boolean
}

// Al ser un Record, si se agrega una operación nueva al tipo TypeScript obliga a
// ponerla también acá.
export const OPERATIONS: Record<Operation, OperationInfo> = {
  add: { symbol: '+', label: 'Suma', hint: 'A + B', unary: false },
  subtract: { symbol: '−', label: 'Resta', hint: 'A − B', unary: false },
  multiply: { symbol: '×', label: 'Multiplicación', hint: 'A × B', unary: false },
  divide: { symbol: '÷', label: 'División', hint: 'A ÷ B', unary: false },
  power: { symbol: 'xʸ', label: 'Potencia', hint: 'A elevado a la B', unary: false },
  sqrt: { symbol: '√', label: 'Raíz cuadrada', hint: 'Raíz cuadrada de A (B no se usa)', unary: true },
  percentage: { symbol: '%', label: 'Porcentaje', hint: 'El A% de B, por ejemplo 20% de 150 = 30', unary: false },
}

// Orden en el que se muestran los botones
export const OPERATION_IDS = Object.keys(OPERATIONS) as Operation[]

// Arma el texto de la operación para la pantalla y el historial, ej: "12 ÷ 4" o "√16"
export function describeOperation(operation: Operation, a: number, b?: number): string {
  const x = formatOperand(a)
  const y = b === undefined ? '' : formatOperand(b)

  switch (operation) {
    case 'sqrt':
      return `√${x}`
    case 'power':
      return `${x}^${y}`
    case 'percentage':
      return `${x}% de ${y}`
    default:
      return `${x} ${OPERATIONS[operation].symbol} ${y}`
  }
}

// Los negativos van entre paréntesis para que se lea bien, ej: "5 − (-3)"
function formatOperand(value: number): string {
  return value < 0 ? `(${formatNumber(value)})` : formatNumber(value)
}
