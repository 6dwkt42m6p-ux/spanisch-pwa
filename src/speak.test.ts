import { afterEach, describe, expect, it, vi } from 'vitest'

type V = { lang: string }
function stub(voices: V[]) {
  const listeners: Record<string, (() => void)[]> = {}
  const synth = {
    getVoices: vi.fn(() => voices),
    addEventListener: (n: string, cb: () => void) => { (listeners[n] ??= []).push(cb) },
    removeEventListener: (n: string, cb: () => void) => { listeners[n] = (listeners[n] ?? []).filter((f) => f !== cb) },
    cancel: vi.fn(), speak: vi.fn(),
  }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', class { lang = ''; voice: unknown; rate = 1; text: string; constructor(text: string) { this.text = text } })
  return { synth, listeners, voices }
}

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules() })

describe('speak', () => {
  it('bevorzugt es-AR vor es-ES', async () => {
    stub([{ lang: 'es-ES' }, { lang: 'de-DE' }, { lang: 'es-AR' }])
    const { spanishVoice } = await import('./speak')
    expect(spanishVoice()?.lang).toBe('es-AR')
  })
  it('ohne spanische Stimme -> null', async () => {
    stub([{ lang: 'de-DE' }])
    const { spanishVoice } = await import('./speak')
    expect(spanishVoice()).toBeNull()
  })
  it('Stimmen kommen erst nach voiceschanged: Cache wird aktualisiert', async () => {
    const s = stub([])
    const { spanishVoice } = await import('./speak')
    expect(spanishVoice()).toBeNull()
    s.voices.push({ lang: 'es-MX' })
    s.listeners['voiceschanged'].forEach((cb) => cb())
    s.synth.getVoices.mockClear()
    expect(spanishVoice()?.lang).toBe('es-MX')
    expect(s.synth.getVoices).not.toHaveBeenCalled()
  })
  it('leerer Cache: leerer Cache löst genau einen getVoices-Aufruf aus', async () => {
    const s = stub([])
    const { spanishVoice } = await import('./speak')
    s.synth.getVoices.mockClear()
    spanishVoice()
    expect(s.synth.getVoices).toHaveBeenCalledTimes(1)
  })
  it('Fallback-lang es-MX ohne Stimme', async () => {
    const s = stub([])
    const { speak } = await import('./speak')
    speak('hola')
    const u = s.synth.speak.mock.calls[0][0] as { lang: string }
    expect(u.lang).toBe('es-MX')
  })
  it('onVoicesChanged meldet Änderungen und lässt sich abmelden', async () => {
    const s = stub([])
    const { onVoicesChanged } = await import('./speak')
    const cb = vi.fn()
    const off = onVoicesChanged(cb)
    s.listeners['voiceschanged'].forEach((f) => f())
    expect(cb).toHaveBeenCalledTimes(1)
    off()
    s.listeners['voiceschanged'].forEach((f) => f())
    expect(cb).toHaveBeenCalledTimes(1)
  })
  it('ohne speechSynthesis: keine Exception', async () => {
    vi.stubGlobal('speechSynthesis', undefined)
    const m = await import('./speak')
    expect(m.spanishVoice()).toBeNull()
    expect(m.speak('x')).toBe(false)
    expect(m.onVoicesChanged(() => {})()).toBeUndefined()
  })
})
