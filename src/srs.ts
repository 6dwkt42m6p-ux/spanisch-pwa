import type { CardState } from './types'

export const AGAIN = 1, HARD = 2, GOOD = 3, EASY = 4
const MIN_EASE = 1.3, MAX_EASE = 3.5

/** Python-round (Banker's Rounding) — Parität zu srs.py. */
export function roundHalfEven(x: number): number {
  const f = Math.floor(x), d = x - f
  if (Math.abs(d - 0.5) < 1e-9) return f % 2 === 0 ? f : f + 1
  return Math.round(x)
}

export function todayISO(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  return todayISO(new Date(y, m - 1, d + days))
}

export function newCard(today: string): CardState {
  return { ease: 2.5, interval: 1, reps: 0, next: today, last: null }
}

/** SM-2 wie srs.py::update_card; gibt neue Karte zurück (pure). */
export function updateCard(card: CardState, rating: number, today: string): CardState {
  const c = { ...card }
  if (rating === AGAIN) {
    c.reps = 0; c.interval = 1; c.ease = Math.max(MIN_EASE, c.ease - 0.2)
  } else if (rating === HARD) {
    c.interval = Math.max(1, roundHalfEven(c.interval * 1.2)); c.ease = Math.max(MIN_EASE, c.ease - 0.15)
  } else if (rating === GOOD) {
    c.interval = c.reps === 0 ? 1 : c.reps === 1 ? 3 : roundHalfEven(c.interval * c.ease)
    c.reps += 1
  } else if (rating === EASY) {
    c.interval = c.reps === 0 ? 4 : roundHalfEven(c.interval * c.ease * 1.3)
    c.ease = Math.min(MAX_EASE, c.ease + 0.15); c.reps += 1
  }
  c.next = addDays(today, c.interval)
  c.last = rating
  return c
}
