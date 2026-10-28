import { CalculatorForm } from './components/CalculatorForm'
import { History } from './components/History'
import { ResultDisplay } from './components/ResultDisplay'
import { useCalculator } from './hooks/useCalculator'

function App() {
  const { display, history, calculate, reset, clearHistory } = useCalculator()

  return (
    <main className="app">
      <header className="app__header">
        <h1>Calculadora</h1>
        <p>Las operaciones se resuelven en una API hecha en Go</p>
      </header>

      <section className="card" aria-label="Calculadora">
        <ResultDisplay display={display} />
        <CalculatorForm
          loading={display.status === 'loading'}
          onCalculate={calculate}
          onReset={reset}
        />
      </section>

      <History entries={history} onClear={clearHistory} />
    </main>
  )
}

export default App
