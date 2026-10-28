import { useRef, useState } from 'react'
import * as calculatorApi from '../api/calculatorApi'
import { describeOperation, type Operation } from '../operations'

const MAX_HISTORY = 10

export interface HistoryEntry {
  id: number
  expression: string
  result: number
}

// Lo que se muestra en la pantalla de la calculadora
export type DisplayState =
  | { status: 'idle' }
  | { status: 'loading'; expression: string }
  | { status: 'success'; expression: string; result: number }
  | { status: 'error'; expression: string; message: string }

// Maneja la llamada a la API y el estado que depende de ella (pantalla e historial).
// La validación de los inputs queda en el formulario.
export function useCalculator() {
  const [display, setDisplay] = useState<DisplayState>({ status: 'idle' })
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const nextId = useRef(1)

  async function calculate(operation: Operation, a: number, b?: number) {
    const expression = describeOperation(operation, a, b)
    setDisplay({ status: 'loading', expression })

    try {
      const result = await calculatorApi.calculate(operation, a, b)
      setDisplay({ status: 'success', expression, result })

      const entry = { id: nextId.current++, expression, result }
      setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Ocurrió un error inesperado'
      setDisplay({ status: 'error', expression, message })
    }
  }

  function reset() {
    setDisplay({ status: 'idle' })
  }

  function clearHistory() {
    setHistory([])
  }

  return { display, history, calculate, reset, clearHistory }
}
