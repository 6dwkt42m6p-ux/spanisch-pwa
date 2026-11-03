import { useCallback, useEffect, useRef, useState } from 'react'
import Grammar from './views/Grammar'
import Info from './views/Info'
import Learn from './views/Learn'
import Phrases from './views/Phrases'
import Scenarios from './views/Scenarios'
import { GOOD, AGAIN, newCard, todayISO, updateCard } from './srs'
import { cardKey, loadProgress, saveProgress, type Progress } from './store'
import type { Direction } from './types'

type Tab = 'learn' | 'phrases' | 'scenarios' | 'grammar' | 'info'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'learn', label: 'Lernen', icon: '🃏' },
  { id: 'phrases', label: 'Phrasen', icon: '💬' },
  { id: 'scenarios', label: 'Szenarien', icon: '🎭' },
  { id: 'grammar', label: 'Grammatik', icon: '📘' },
  { id: 'info', label: 'Info', icon: 'ℹ️' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('learn')
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => { mainRef.current?.scrollTo(0, 0) }, [tab])
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
      <main className="main" ref={mainRef}>
        {tab === 'learn' && <Learn progress={progress} onRate={onRate} />}
        {tab === 'phrases' && <Phrases />}
        {tab === 'scenarios' && <Scenarios />}
        {tab === 'grammar' && <Grammar />}
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
