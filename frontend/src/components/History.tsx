import type { HistoryEntry } from '../hooks/useCalculator'
import { formatNumber } from '../utils/numbers'

interface Props {
  entries: HistoryEntry[]
  onClear: () => void
}

export function History({ entries, onClear }: Props) {
  return (
    <aside className="history card" aria-labelledby="history-title">
      <div className="history__header">
        <h2 id="history-title">Historial</h2>
        {entries.length > 0 && (
          <button type="button" className="btn-link" onClick={onClear}>
            Borrar
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="history__empty">Todavía no hay operaciones.</p>
      ) : (
        <ol className="history__list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <span>{entry.expression} =</span>
              <strong>{formatNumber(entry.result)}</strong>
            </li>
          ))}
        </ol>
      )}
    </aside>
  )
}
