import { useState } from 'react'
import { scenariosSorted } from '../content'
import { speak } from '../speak'
import type { Scenario } from '../types'

const ROLE_DE: Record<string, string> = { traveler: 'Du' }
const roleLabel = (r: string) => ROLE_DE[r] ?? (r.charAt(0).toUpperCase() + r.slice(1))

function Detail({ s, onBack }: { s: Scenario; onBack: () => void }) {
  const [shown, setShown] = useState<Set<number>>(new Set())
  const hasDe = s.sample_dialogue.some((l) => l.text_de)
  const allShown = shown.size === s.sample_dialogue.filter((l) => l.text_de).length
  const toggle = (i: number) => setShown((p) => { const n = new Set(p); if (n.has(i)) n.delete(i); else n.add(i); return n })

  return (
    <section className="view">
      <button className="back" onClick={onBack}>‹ Zurück</button>
      <h1 className="title">{s.icon} {s.title}</h1>
      <p className="muted">{s.description}</p>
      {s.context && <p className="note">{s.context}</p>}

      <h2 className="group-title">Schlüsselphrasen</h2>
      <div className="panel">
        {s.key_phrases.map((p, i) => (
          <div key={i} className="phrase-row">
            <div className="phrase-main static">
              <strong>{p}</strong>
              {s.key_phrases_de?.[i] && <span className="muted">{s.key_phrases_de[i]}</span>}
            </div>
            <button className="icon-btn" onClick={() => speak(p)} aria-label="Phrase vorlesen">🔊</button>
          </div>
        ))}
      </div>

      <h2 className="group-title">Dialog</h2>
      {hasDe && (
        <button className="btn ghost" onClick={() => setShown(allShown ? new Set() : new Set(s.sample_dialogue.flatMap((l, i) => l.text_de ? [i] : [])))}>
          {allShown ? 'Übersetzungen ausblenden' : 'Alle Übersetzungen'}
        </button>
      )}
      <div className="dialog">
        {s.sample_dialogue.map((l, i) => (
          <div key={i} className={l.role === 'traveler' ? 'bubble me' : 'bubble'}>
            <div className="role">{roleLabel(l.role)}</div>
            <div className="line">
              {l.text_de ? (
                <button className="bubble-text" onClick={() => toggle(i)} aria-expanded={shown.has(i)}>{l.text}</button>
              ) : (
                <span className="bubble-text">{l.text}</span>
              )}
              <button className="icon-btn" onClick={() => speak(l.text)} aria-label="Zeile vorlesen">🔊</button>
            </div>
            {l.text_de && shown.has(i) && <div className="muted tr">{l.text_de}</div>}
          </div>
        ))}
      </div>

      {s.cultural_notes && s.cultural_notes.length > 0 && (
        <>
          <h2 className="group-title">Kulturhinweise</h2>
          <div className="panel">
            <ul className="list">{s.cultural_notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
          </div>
        </>
      )}
    </section>
  )
}

export default function Scenarios() {
  const [open, setOpen] = useState<string | null>(null)
  const list = scenariosSorted()
  const current = list.find((s) => s.id === open)
  if (current) return <Detail s={current} onBack={() => setOpen(null)} />
  return (
    <section className="view">
      <h1 className="title">Szenarien</h1>
      {list.map((s) => (
        <button key={s.id} className="list-item" onClick={() => setOpen(s.id)}>
          <span className="li-icon" aria-hidden="true">{s.icon}</span>
          <span className="li-body">
            <strong>{s.title}</strong>
            <span className="muted">{s.description}</span>
          </span>
        </button>
      ))}
    </section>
  )
}
