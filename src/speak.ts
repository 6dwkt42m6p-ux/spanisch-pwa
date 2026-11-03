const PREF = ['es-AR', 'es-CL', 'es-419', 'es-US', 'es-MX', 'es-ES']
const FALLBACK_LANG = 'es-MX'

const hasSynth = () => typeof speechSynthesis !== 'undefined' && !!speechSynthesis

// iOS liefert getVoices() beim ersten Aufruf oft leer -> beim Modulstart und bei voiceschanged cachen
let cache: SpeechSynthesisVoice[] = []
function refresh() {
  if (hasSynth()) cache = speechSynthesis.getVoices()
}
refresh()
if (hasSynth() && typeof speechSynthesis.addEventListener === 'function') {
  speechSynthesis.addEventListener('voiceschanged', refresh)
}

/** Callback bei geänderter Stimmenliste (Cache ist dann bereits aktuell); gibt Abmelde-Funktion zurück. */
export function onVoicesChanged(cb: () => void): () => void {
  if (!hasSynth() || typeof speechSynthesis.addEventListener !== 'function') return () => {}
  const handler = () => { refresh(); cb() }
  speechSynthesis.addEventListener('voiceschanged', handler)
  return () => speechSynthesis.removeEventListener('voiceschanged', handler)
}

export function spanishVoice(): SpeechSynthesisVoice | null {
  if (!hasSynth()) return null
  if (cache.length === 0) refresh()
  const vs = cache.filter((v) => v.lang.toLowerCase().startsWith('es'))
  for (const p of PREF) { const hit = vs.find((v) => v.lang.replace('_', '-') === p); if (hit) return hit }
  return vs[0] ?? null
}

export function speak(text: string): boolean {
  if (!hasSynth()) return false
  // "a / b"-Varianten nacheinander lesen statt "Schrägstrich"
  const u = new SpeechSynthesisUtterance(text.replace(/\s*\/\s*/g, ', ').replace(/\(.*?\)/g, ''))
  const voice = spanishVoice()
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? FALLBACK_LANG
  u.rate = 0.9
  speechSynthesis.cancel(); speechSynthesis.speak(u)
  return true
}
