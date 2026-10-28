import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { History } from './History'

describe('History', () => {
  it('avisa cuando no hay operaciones y no muestra el botón de borrar', () => {
    render(<History entries={[]} onClear={vi.fn()} />)

    expect(screen.getByText('Todavía no hay operaciones.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Borrar' })).not.toBeInTheDocument()
  })

  it('lista las operaciones con su resultado', () => {
    const entries = [
      { id: 2, expression: '√16', result: 4 },
      { id: 1, expression: '1 ÷ 3', result: 1 / 3 },
    ]
    render(<History entries={entries} onClear={vi.fn()} />)

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('√16 =4')
    expect(items[1]).toHaveTextContent('1 ÷ 3 =0.333333333333')
  })

  it('llama a onClear al apretar Borrar', async () => {
    const onClear = vi.fn()
    render(<History entries={[{ id: 1, expression: '1 + 1', result: 2 }]} onClear={onClear} />)

    await userEvent.click(screen.getByRole('button', { name: 'Borrar' }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
