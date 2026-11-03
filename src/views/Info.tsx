import { useEffect, useState } from 'react'
import { VOCAB } from '../content'
import { onVoicesChanged, spanishVoice } from '../speak'
import { todayISO } from '../srs'
import type { Progress } from '../store'

interface Props { progress: Progress; onReset: () => void }

export default function Info({ progress, onReset }: Props) {
  const [voice, setVoice] = useState<string | null>(() => spanishVoice()?.lang ?? null)

  useEffect(() => {
    return onVoicesChanged(() => setVoice(spanishVoice()?.lang ?? null))
  }, [])

  const cards = Object.values(progress.cards)
  const today = todayISO()
  const due = cards.filter((c) => c.next <= today).length

  return (
    <section className="view">
      <h1 className="title">Info</h1>
      <div className="panel">
        <div className="stat"><span>Karten gelernt</span><strong>{cards.length}</strong></div>
        <div className="stat"><span>Heute fällig</span><strong>{due}</strong></div>
        <div className="stat"><span>Vokabeln im Bundle</span><strong>{VOCAB.length}</strong></div>
      </div>

      <div className="panel">
        <h2 className="group-title">Vorlesen</h2>
        {voice ? (
          <p>Spanische Stimme gefunden ({voice}).</p>
        ) : (
          <p>
            Keine spanische Stimme gefunden. Auf dem iPhone laden unter:{' '}
            <em>Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Spanisch</em>.
          </p>
        )}
      </div>

      <div className="panel">
        <h2 className="group-title">Installieren</h2>
        <p>Zum Home-Bildschirm: Teilen → Zum Home-Bildschirm. Danach läuft die App auch im Flugmodus.</p>
      </div>

      <button
        className="btn danger"
        onClick={() => { if (confirm('Lernstand wirklich zurücksetzen?')) onReset() }}
      >
        Lernstand zurücksetzen
      </button>
    </section>
  )
}
