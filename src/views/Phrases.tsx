import { useMemo, useState } from 'react'
import { phrases } from '../content'
import { speak } from '../speak'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function Phrases() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const groups = useMemo(() => {
    const needle = norm(q.trim())
    const m = new Map<string, ReturnType<typeof phrases>>()
    for (const v of phrases()) {
      if (needle && !norm(v.spanish).includes(needle) && !norm(v.german).includes(needle)) continue
      m.set(v.category, [...(m.get(v.category) ?? []), v])
    }
    return [...m.entries()].sort(([a], [b]) =>
      a === 'Patagonien' ? -1 : b === 'Patagonien' ? 1 : a.localeCompare(b, 'de'))
  }, [q])

  return (
    <section className="view">
      <input
        className="search"
        type="search"
        placeholder="Suchen (Spanisch oder Deutsch)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Phrasen suchen"
      />
      {groups.length === 0 && <p className="muted center">Nichts gefunden.</p>}
      {groups.map(([cat, items]) => (
        <div key={cat} className="group">
          <h2 className="group-title">{cat}</h2>
          {items.map((v) => (
            <div key={v.id} className="phrase">
              <div className="phrase-row">
                <button className="phrase-main" onClick={() => setOpen(open === v.id ? null : v.id)} aria-expanded={open === v.id}>
                  <strong>{v.spanish}</strong>
                  <span className="muted">{v.german}</span>
                </button>
                <button className="icon-btn" onClick={() => speak(v.spanish)} aria-label={`${v.spanish} vorlesen`}>🔊</button>
              </div>
              {open === v.id && (
                <div className="phrase-detail">
                  {v.example_es && (
                    <div className="line">
                      <div>{v.example_es}<div className="muted">{v.example_de}</div></div>
                      <button className="icon-btn" onClick={() => speak(v.example_es)} aria-label="Beispielsatz vorlesen">🔊</button>
                    </div>
                  )}
                  {v.south_american_note && <div className="note">📍 {v.south_american_note}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
