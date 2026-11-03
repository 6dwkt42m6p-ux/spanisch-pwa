const PREF = ['es-AR', 'es-CL', 'es-419', 'es-US', 'es-MX', 'es-ES']

export function spanishVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const vs = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'))
  for (const p of PREF) { const hit = vs.find((v) => v.lang.replace('_', '-') === p); if (hit) return hit }
  return vs[0] ?? null
}

export function speak(text: string): boolean {
  if (typeof speechSynthesis === 'undefined') return false
  // "a / b"-Varianten nacheinander lesen statt "Schrägstrich"
  const u = new SpeechSynthesisUtterance(text.replace(/\s*\/\s*/g, ', ').replace(/\(.*?\)/g, ''))
  const voice = spanishVoice()
  if (voice) u.voice = voice
  u.lang = voice?.lang ?? 'es-419'
  u.rate = 0.9
  speechSynthesis.cancel(); speechSynthesis.speak(u)
  return true
}
