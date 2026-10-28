import { useRef, useState, type FormEvent, type Ref } from 'react'
import { OPERATION_IDS, OPERATIONS, type Operation } from '../operations'
import { parseNumber } from '../utils/numbers'

interface Props {
  loading: boolean
  onCalculate: (operation: Operation, a: number, b?: number) => void
  onReset: () => void
}

interface FieldErrors {
  a?: string
  b?: string
}

export function CalculatorForm({ loading, onCalculate, onReset }: Props) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [operation, setOperation] = useState<Operation>('add')
  const [errors, setErrors] = useState<FieldErrors>({})
  const inputARef = useRef<HTMLInputElement>(null)

  const { unary, hint } = OPERATIONS[operation]

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    const parsedA = parseNumber(a)
    // Para la raíz cuadrada B no se usa, así que tampoco se valida
    const parsedB = unary ? undefined : parseNumber(b)

    setErrors({
      a: parsedA.ok ? undefined : parsedA.error,
      b: parsedB && !parsedB.ok ? parsedB.error : undefined,
    })

    if (!parsedA.ok || (parsedB && !parsedB.ok)) return

    onCalculate(operation, parsedA.value, parsedB?.value)
  }

  function handleOperationChange(id: Operation) {
    setOperation(id)
    // Si se cambia a raíz cuadrada el error de B ya no aplica
    if (OPERATIONS[id].unary) {
      setErrors((prev) => ({ ...prev, b: undefined }))
    }
  }

  function handleReset() {
    setA('')
    setB('')
    setErrors({})
    onReset()
    inputARef.current?.focus()
  }

  return (
    <form className="calc-form" onSubmit={handleSubmit} noValidate>
      <NumberField
        id="input-a"
        label="Número A"
        placeholder="Ej: 12"
        value={a}
        error={errors.a}
        inputRef={inputARef}
        onChange={setA}
      />

      <fieldset className="operations">
        <legend>Operación</legend>
        <div className="operations__grid">
          {OPERATION_IDS.map((id) => (
            <label
              key={id}
              className={id === operation ? 'operation operation--active' : 'operation'}
              title={OPERATIONS[id].label}
            >
              <input
                type="radio"
                name="operation"
                value={id}
                checked={id === operation}
                onChange={() => handleOperationChange(id)}
              />
              <span aria-hidden="true">{OPERATIONS[id].symbol}</span>
              <span className="sr-only">{OPERATIONS[id].label}</span>
            </label>
          ))}
        </div>
        <p className="operations__hint">{hint}</p>
      </fieldset>

      <NumberField
        id="input-b"
        label={unary ? 'Número B (no se usa)' : 'Número B'}
        placeholder={unary ? '' : 'Ej: 4'}
        value={b}
        error={errors.b}
        disabled={unary}
        onChange={setB}
      />

      <div className="actions">
        <button type="button" className="btn btn--secondary" onClick={handleReset}>
          Limpiar
        </button>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? 'Calculando...' : 'Calcular ='}
        </button>
      </div>
    </form>
  )
}

interface NumberFieldProps {
  id: string
  label: string
  placeholder: string
  value: string
  error?: string
  disabled?: boolean
  inputRef?: Ref<HTMLInputElement>
  onChange: (value: string) => void
}

function NumberField({ id, label, placeholder, value, error, disabled, inputRef, onChange }: NumberFieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}
