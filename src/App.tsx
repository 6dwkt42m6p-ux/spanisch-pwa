import { useCallback, useState } from 'react'
import Info from './views/Info'
import Learn from './views/Learn'
import Phrases from './views/Phrases'
import { GOOD, AGAIN, newCard, todayISO, updateCard } from './srs'
import { cardKey, loadProgress, saveProgress, type Progress } from './store'
import type { Direction } from './types'

type Tab = 'learn' | 'phrases' | 'info'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'learn', label: 'Lernen', icon: '🃏' },
  { id: 'phrases', label: 'Phrasen', icon: '💬' },
  { id: 'info', label: 'Info', icon: 'ℹ️' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('learn')
  const [progress, setProgress] = useState<Progress>(loadProgress)

  const onRate = useCallback((id: string, dir: Direction, known: boolean) => {
    setProgress((prev) => {
      const today = todayISO()
      const key = cardKey(id, dir)
      const card = updateCard(prev.cards[key] ?? newCard(today), known ? GOOD : AGAIN, today)
      const next = { cards: { ...prev.cards, [key]: card } }
      saveProgress(next)
      return next
    })
  }, [])

  const onReset = useCallback(() => {
    const empty = { cards: {} }
    saveProgress(empty)
    setProgress(empty)
  }, [])

  return (
    <div className="app">
      <main className="main">
        {tab === 'learn' && <Learn progress={progress} onRate={onRate} />}
        {tab === 'phrases' && <Phrases />}
        {tab === 'info' && <Info progress={progress} onReset={onReset} />}
      </main>
      <nav className="tabbar" aria-label="Hauptnavigation">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={t.id === tab ? 'tab active' : 'tab'}
            aria-current={t.id === tab ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
