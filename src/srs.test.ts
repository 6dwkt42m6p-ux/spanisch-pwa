import { describe, expect, it } from 'vitest'
import { addDays, newCard, roundHalfEven, updateCard, AGAIN, GOOD, EASY } from './srs'

const T = '2026-11-03'

describe('srs (Port srs.py)', () => {
  it('Gut: 1 -> 3 -> round(3*2.5)', () => {
    let c = newCard(T)
    c = updateCard(c, GOOD, T); expect(c.interval).toBe(1)
    c = updateCard(c, GOOD, T); expect(c.interval).toBe(3)
    c = updateCard(c, GOOD, T); expect(c.interval).toBe(8) // Python round(7.5) == 8
    expect(c.next).toBe(addDays(T, 8))
  })
  it('Nochmal: Reset, Ease -0.2', () => {
    const c = updateCard({ ease: 2.5, interval: 10, reps: 4, next: T, last: null }, AGAIN, T)
    expect([c.interval, c.reps]).toEqual([1, 0])
    expect(c.ease).toBeCloseTo(2.3)
  })
  it('Leicht: Ease-Cap 3.5', () => {
    const c = updateCard({ ...newCard(T), ease: 3.45 }, EASY, T)
    expect(c.ease).toBeCloseTo(3.5)
  })
  it('roundHalfEven = Python round', () => {
    expect([0.5, 1.5, 2.5, 7.5, 2.4, 2.6].map(roundHalfEven)).toEqual([0, 2, 2, 8, 2, 3])
  })
  it('addDays über Monatsgrenze', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
  })
  it('updateCard mutiert die Eingabe nicht', () => {
    const c = newCard(T); updateCard(c, GOOD, T); expect(c.reps).toBe(0)
  })
})
