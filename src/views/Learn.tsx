import { useMemo, useState } from 'react'
import { ALL, BASICS, VOCAB, categories } from '../content'
import { buildQueue, requeue, type QItem } from '../queue'
import { speak } from '../speak'
import { todayISO } from '../srs'
import type { Progress } from '../store'
import type { Direction } from '../types'

const FILTER_KEY = 'spanisch-pwa:filter'
const BY_ID = new Map(VOCAB.map((v) => [v.id, v]))

function loadFilter(): string {
  try {
    const f = localStorage.getItem(FILTER_KEY)
    if (f === BASICS || f === ALL || (f && categories().includes(f))) return f
  } catch { /* kein Storage -> Default */ }
  return BASICS
}

interface Props {
  progress: Progress
  onRate: (id: string, dir: Direction, known: boolean) => void
}

export default function Learn({ progress, onRate }: Props) {
  const [filter, setFilter] = useState(loadFilter)
  const [queue, setQueue] = useState<QItem[]>(() => buildQueue(VOCAB, progress.cards, loadFilter(), todayISO()))
  const [revealed, setRevealed] = useState(false)
  const cats = useMemo(categories, [])

  const restart = (f: string) => setQueue(buildQueue(VOCAB, progress.cards, f, todayISO()))

  const changeFilter = (f: string) => {
    setFilter(f)
    try { localStorage.setItem(FILTER_KEY, f) } catch { /* ignorieren */ }
    setRevealed(false)
    restart(f)
  }

  const rate = (known: boolean) => {
    const head = queue[0]
    if (!head) return
    onRate(head.id, head.dir, known)
    setQueue((q) => requeue(q, known))
    setRevealed(false)
  }

  const head = queue[0]
  const vocab = head ? BY_ID.get(head.id) : undefined

  return (
    <section className="view">
      <div className="toolbar">
        <select className="select" value={filter} onChange={(e) => changeFilter(e.target.value)} aria-label="Wortschatz wählen">
          <option value={BASICS}>Basics (Patagonien + leicht)</option>
          <option value={ALL}>Alle Wörter</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="counter">{queue.length > 0 ? `noch ${queue.length}` : ''}</span>
      </div>

      {head && vocab ? (
        <>
          <div
            className={revealed ? 'card revealed' : 'card'}
            role="button"
            tabIndex={0}
            onClick={() => setRevealed(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRevealed(true) }}
          >
            <span className="badge">{head.dir === 'es_de' ? 'Español → Deutsch' : 'Deutsch → Español'}</span>
            <div className="card-front">{head.dir === 'es_de' ? vocab.spanish : vocab.german}</div>
            {!revealed && <div className="hint">Tippen zum Aufdecken</div>}
            {revealed && (
              <div className="card-back">
                <div className="answer">{head.dir === 'es_de' ? vocab.german : vocab.spanish}</div>
                {vocab.pronunciation && <div className="pron">[{vocab.pronunciation}]</div>}
                {vocab.example_es && (
                  <div className="example">
                    <div>{vocab.example_es}</div>
                    <div className="muted">{vocab.example_de}</div>
                  </div>
                )}
                {vocab.south_american_note && <div className="note">📍 {vocab.south_american_note}</div>}
                <button
                  className="speak"
                  onClick={(e) => { e.stopPropagation(); speak(vocab.spanish) }}
                  aria-label="Spanisch vorlesen"
                >
                  🔊 Vorlesen
                </button>
              </div>
            )}
          </div>
          <div className="actions">
            <button className="btn no" disabled={!revealed} onClick={() => rate(false)}>Weiß ich nicht</button>
            <button className="btn yes" disabled={!revealed} onClick={() => rate(true)}>Weiß ich</button>
          </div>
        </>
      ) : (
        <div className="done">
          <div className="done-title">Fertig für heute 🎉</div>
          <p className="muted">Keine Karten mehr fällig.</p>
          <button className="btn yes" onClick={() => restart(filter)}>10 neue Wörter</button>
        </div>
      )}
    </section>
  )
}
