import { useEffect, useMemo, useState } from 'react'
import { ALL, BASICS, VOCAB, categories } from '../content'
import { buildQueue, requeue, seenCount, type QItem } from '../queue'
import { speak } from '../speak'
import { todayISO } from '../srs'
import type { Progress } from '../store'
import type { Direction } from '../types'

const FILTER_KEY = 'spanisch-pwa:filter'
const AUTOSPEAK_KEY = 'spanisch-pwa:autospeak'
const BY_ID = new Map(VOCAB.map((v) => [v.id, v]))

function loadFilter(): string {
  try {
    const f = localStorage.getItem(FILTER_KEY)
    if (f === BASICS || f === ALL || (f && categories().includes(f))) return f
  } catch { /* kein Storage -> Default */ }
  return BASICS
}

function loadAutospeak(): boolean {
  try { return localStorage.getItem(AUTOSPEAK_KEY) === '1' } catch { return false }
}

interface Props {
  progress: Progress
  onRate: (id: string, dir: Direction, known: boolean) => void
}

export default function Learn({ progress, onRate }: Props) {
  const [filter, setFilter] = useState(loadFilter)
  const [queue, setQueue] = useState<QItem[]>(() => buildQueue(VOCAB, progress.cards, loadFilter(), todayISO()))
  const [revealed, setRevealed] = useState(false)
  const [autospeak, setAutospeak] = useState(loadAutospeak)
  const cats = useMemo(categories, [])
  const { seen, total } = useMemo(() => seenCount(VOCAB, progress.cards, filter), [progress.cards, filter])

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

  const toggleAutospeak = (on: boolean) => {
    setAutospeak(on)
    try { localStorage.setItem(AUTOSPEAK_KEY, on ? '1' : '0') } catch { /* ignorieren */ }
    // iOS gibt Sprachausgabe erst nach einer Nutzer-Geste frei: beim Einschalten direkt vorlesen
    if (on && vocab) speak(vocab.spanish)
  }

  // Hör-Modus ES->DE: Spanisch beim Erscheinen der Karte
  useEffect(() => {
    if (autospeak && head?.dir === 'es_de' && vocab) speak(vocab.spanish)
  }, [head, autospeak, vocab])

  // Hör-Modus DE->ES: Spanisch beim Aufdecken
  const reveal = () => {
    setRevealed(true)
    if (autospeak && head?.dir === 'de_es' && vocab) speak(vocab.spanish)
  }

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

      <div className="progress-row">
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={seen}
             aria-label="Fortschritt">
          <div className="progress-fill" style={{ width: total ? `${(seen / total) * 100}%` : '0%' }} />
        </div>
        <span className="counter">{seen} von {total} gesehen</span>
      </div>
      <label className="switch">
        <input type="checkbox" checked={autospeak} onChange={(e) => toggleAutospeak(e.target.checked)} />
        <span>🎧 Hör-Modus (automatisch vorlesen)</span>
      </label>

      {head && vocab ? (
        <>
          <div className={revealed ? 'card revealed' : 'card'}>
            <button className="card-face" onClick={reveal} disabled={revealed}
                    aria-label={revealed ? undefined : 'Karte aufdecken'}>
              <span className="badge">{head.dir === 'es_de' ? 'Español → Deutsch' : 'Deutsch → Español'}</span>
              <span className="card-front">{head.dir === 'es_de' ? vocab.spanish : vocab.german}</span>
              {!revealed && <span className="hint">Tippen zum Aufdecken</span>}
            </button>
            {revealed && (
              <div className="card-back">
                <div className="answer">{head.dir === 'es_de' ? vocab.german : vocab.spanish}</div>
                {vocab.pronunciation && <div className="pron">[{vocab.pronunciation}]</div>}
                {vocab.example_es && (
                  <div className="example">
                    <div className="line">
                      <span>{vocab.example_es}</span>
                      <button className="icon-btn" onClick={() => speak(vocab.example_es)} aria-label="Beispielsatz vorlesen">🔊</button>
                    </div>
                    <div className="muted">{vocab.example_de}</div>
                  </div>
                )}
                {vocab.south_american_note && <div className="note">📍 {vocab.south_american_note}</div>}
                <button className="speak" onClick={() => speak(vocab.spanish)} aria-label="Spanisch vorlesen">
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
