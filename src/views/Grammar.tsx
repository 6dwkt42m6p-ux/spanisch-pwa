import { useState } from 'react'
import { GRAMMAR } from '../content'
import { speak } from '../speak'
import type { Example, GrammarLesson } from '../types'

const LEVEL = ['', 'Einstieg', 'Aufbau', 'Fortgeschritten']
const levelLabel = (n: number) => LEVEL[n] ?? `Stufe ${n}`

function Examples({ items }: { items: Example[] }) {
  return (
    <div className="panel">
      {items.map((e, i) => (
        <div key={i} className="phrase-row">
          <div className="phrase-main static"><strong>{e.es}</strong><span className="muted">{e.de}</span></div>
          <button className="icon-btn" onClick={() => speak(e.es)} aria-label="Beispiel vorlesen">🔊</button>
        </div>
      ))}
    </div>
  )
}

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <>
    <h2 className="group-title">{title}</h2>
    {children}
  </>
)

const Text = ({ children }: { children: React.ReactNode }) => <div className="panel prose">{children}</div>

function Detail({ g, onBack }: { g: GrammarLesson; onBack: () => void }) {
  return (
    <section className="view">
      <button className="back" onClick={onBack}>‹ Zurück</button>
      <h1 className="title">{g.title}</h1>
      <p className="muted">{g.subtitle}</p>
      <Text>{g.explanation}</Text>

      {g.memory_trick && <Block title="Merkhilfe"><Text>{g.memory_trick}</Text></Block>}

      {g.conjugation_tables?.map((t) => (
        <Block key={t.verb} title={`${t.verb} · ${t.type}`}>
          <div className="panel table-wrap">
            <table className="conj">
              <tbody>
                {t.rows.map((r) => (
                  <tr key={r.person}><th scope="row">{r.person}</th><td><strong>{r.form}</strong></td><td className="muted">{r.german}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      ))}

      {g.comparison_table && (
        <Block title="tú ↔ vos">
          <div className="panel table-wrap">
            <table className="conj">
              <tbody>
                {g.comparison_table.map((r) => (
                  <tr key={r.vos_form}><td>{r.tú_form}</td><td><strong>{r.vos_form}</strong></td><td className="muted">{r.german}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      )}
      {g.voseo_rule && <Block title="Voseo-Regel"><Text>{g.voseo_rule}</Text></Block>}
      {g.preterite_vs_imperfect && <Block title="Indefinido vs. Imperfecto"><Text>{g.preterite_vs_imperfect}</Text></Block>}

      {g.question_words && (
        <Block title="Fragewörter">
          <Examples items={g.question_words.map((q) => ({ es: `${q.word} – ${q.example_es}`, de: `${q.german} – ${q.example_de}` }))} />
        </Block>
      )}
      {g.key_forms && (
        <Block title="Wichtige Formen">
          <Examples items={g.key_forms.map((k) => ({ es: `${k.form} – ${k.example_es}`, de: `${k.german} – ${k.example_de}` }))} />
        </Block>
      )}
      {g.key_constructions?.map((c) => (
        <Block key={c.pattern} title={`${c.pattern} · ${c.german}`}><Examples items={c.examples} /></Block>
      ))}
      {g.negation_patterns && (
        <Block title="Verneinung">
          <Examples items={g.negation_patterns.map((n) => ({ es: n.example_es, de: `${n.pattern} – ${n.example_de}` }))} />
        </Block>
      )}

      {g.examples && g.examples.length > 0 && <Block title="Beispiele"><Examples items={g.examples} /></Block>}
      {g.useful_phrases && <Block title="Nützliche Phrasen"><Examples items={g.useful_phrases} /></Block>}

      {g.time_markers && <Block title="Signalwörter"><div className="panel"><ul className="list">{g.time_markers.map((m) => <li key={m}>{m}</li>)}</ul></div></Block>}
      {g.essential_travel_questions && (
        <Block title="Reisefragen"><div className="panel"><ul className="list">{g.essential_travel_questions.map((m) => <li key={m}>{m}</li>)}</ul></div></Block>
      )}
      {g.travel_tip && <Block title="Reisetipp"><div className="panel note">{g.travel_tip}</div></Block>}
    </section>
  )
}

export default function Grammar() {
  const [open, setOpen] = useState<string | null>(null)
  const current = GRAMMAR.find((g) => g.id === open)
  if (current) return <Detail g={current} onBack={() => setOpen(null)} />
  return (
    <section className="view">
      <h1 className="title">Grammatik</h1>
      {GRAMMAR.map((g) => (
        <button key={g.id} className="list-item" onClick={() => setOpen(g.id)}>
          <span className="li-body">
            <strong>{g.title}</strong>
            <span className="muted">{g.subtitle}</span>
          </span>
          <span className={`level level-${g.level}`}>{levelLabel(g.level)}</span>
        </button>
      ))}
    </section>
  )
}
