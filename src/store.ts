import type { CardState, Direction } from './types'

export const KEY = 'spanisch-pwa:v1'
export interface Progress { cards: Record<string, CardState> }

export const cardKey = (id: string, dir: Direction) => `${id}|${dir}`

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { cards: {} }
    const p = JSON.parse(raw)
    if (p && typeof p === 'object' && !Array.isArray(p) && p.cards && typeof p.cards === 'object') return { cards: p.cards }
  } catch { /* defekter Eintrag -> frisch starten */ }
  return { cards: {} }
}

export function saveProgress(p: Progress): void {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* Quota/Privatmodus: Runde läuft weiter */ }
}
