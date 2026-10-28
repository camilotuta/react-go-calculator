import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CalculatorForm } from './CalculatorForm'

function renderForm(loading = false) {
  const onCalculate = vi.fn()
  const onReset = vi.fn()
  const user = userEvent.setup()

  render(<CalculatorForm loading={loading} onCalculate={onCalculate} onReset={onReset} />)

  return { user, onCalculate, onReset }
}

const inputA = () => screen.getByLabelText(/número a/i)
const inputB = () => screen.getByLabelText(/número b/i)
const submitButton = () => screen.getByRole('button', { name: /calcular/i })

describe('CalculatorForm', () => {
  it('manda los números y la operación elegida', async () => {
    const { user, onCalculate } = renderForm()

    await user.type(inputA(), '12')
    await user.click(screen.getByRole('radio', { name: 'División' }))
    await user.type(inputB(), '4')
    await user.click(submitButton())

    expect(onCalculate).toHaveBeenCalledWith('divide', 12, 4)
  })

  it('usa la suma por defecto y acepta coma decimal', async () => {
    const { user, onCalculate } = renderForm()

    await user.type(inputA(), '1,5')
    await user.type(inputB(), '2')
    await user.click(submitButton())

    expect(onCalculate).toHaveBeenCalledWith('add', 1.5, 2)
  })

  it('se puede calcular con Enter', async () => {
    const { user, onCalculate } = renderForm()

    await user.type(inputA(), '2')
    await user.type(inputB(), '3{Enter}')

    expect(onCalculate).toHaveBeenCalledWith('add', 2, 3)
  })

  it('no manda nada y marca los campos si están vacíos', async () => {
    const { user, onCalculate } = renderForm()

    await user.click(submitButton())

    expect(onCalculate).not.toHaveBeenCalled()
    expect(screen.getAllByText('Este campo es obligatorio')).toHaveLength(2)
    expect(inputA()).toHaveAttribute('aria-invalid', 'true')
    expect(inputA()).toHaveAccessibleDescription('Este campo es obligatorio')
  })

  it('muestra un error si lo escrito no es un número', async () => {
    const { user, onCalculate } = renderForm()

    await user.type(inputA(), 'hola')
    await user.type(inputB(), '2')
    await user.click(submitButton())

    expect(onCalculate).not.toHaveBeenCalled()
    expect(screen.getByText(/escribe un número válido/i)).toBeInTheDocument()
    expect(inputB()).not.toHaveAttribute('aria-invalid')
  })

  it('con raíz cuadrada desactiva B y solo manda A', async () => {
    const { user, onCalculate } = renderForm()

    await user.click(screen.getByRole('radio', { name: 'Raíz cuadrada' }))
    expect(inputB()).toBeDisabled()

    await user.type(inputA(), '16')
    await user.click(submitButton())

    expect(onCalculate).toHaveBeenCalledWith('sqrt', 16, undefined)
  })

  it('al pasar a raíz cuadrada se quita el error de B', async () => {
    const { user } = renderForm()

    await user.type(inputA(), '9')
    await user.click(submitButton())
    expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Raíz cuadrada' }))

    expect(screen.queryByText('Este campo es obligatorio')).not.toBeInTheDocument()
  })

  it('muestra una ayuda según la operación', async () => {
    const { user } = renderForm()

    await user.click(screen.getByRole('radio', { name: 'Porcentaje' }))

    expect(screen.getByText(/el a% de b/i)).toBeInTheDocument()
  })

  it('Limpiar borra los campos y los errores', async () => {
    const { user, onReset } = renderForm()

    await user.type(inputA(), 'abc')
    await user.click(submitButton())
    await user.click(screen.getByRole('button', { name: 'Limpiar' }))

    expect(inputA()).toHaveValue('')
    expect(inputA()).toHaveFocus()
    expect(screen.queryByText(/escribe un número válido/i)).not.toBeInTheDocument()
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('mientras carga desactiva el botón y no deja mandar otra vez', () => {
    const { onCalculate } = renderForm(true)

    expect(screen.getByRole('button', { name: 'Calculando...' })).toBeDisabled()

    // se fuerza el submit para probar el chequeo de loading del handler
    fireEvent.change(inputA(), { target: { value: '1' } })
    fireEvent.change(inputB(), { target: { value: '1' } })
    fireEvent.submit(inputA().closest('form')!)

    expect(onCalculate).not.toHaveBeenCalled()
  })
})
