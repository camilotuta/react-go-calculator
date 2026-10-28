import type { DisplayState } from '../hooks/useCalculator'
import { formatNumber } from '../utils/numbers'

interface Props {
  display: DisplayState
}

export function ResultDisplay({ display }: Props) {
  return (
    <div className={`display display--${display.status}`}>
      {display.status === 'idle' && (
        <>
          <p className="display__expression">Escribe los números y elige una operación</p>
          <p className="display__value">0</p>
        </>
      )}

      {display.status === 'loading' && (
        <>
          <p className="display__expression">{display.expression}</p>
          <p className="display__value">Calculando...</p>
        </>
      )}

      {display.status === 'success' && (
        <>
          <p className="display__expression">{display.expression} =</p>
          <output className="display__value">{formatNumber(display.result)}</output>
        </>
      )}

      {display.status === 'error' && (
        <>
          <p className="display__expression">{display.expression}</p>
          <p className="display__error" role="alert">
            {display.message}
          </p>
        </>
      )}
    </div>
  )
}
