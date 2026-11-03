import { beforeEach, describe, expect, it } from 'vitest'
import { KEY, cardKey, loadProgress, saveProgress } from './store'

describe('store', () => {
  beforeEach(() => localStorage.clear())
  it('leer ohne Eintrag', () => expect(loadProgress()).toEqual({ cards: {} }))
  it('Roundtrip', () => {
    const p = { cards: { [cardKey('v001', 'es_de')]: { ease: 2.5, interval: 1, reps: 1, next: '2026-11-04', last: 3 } } }
    saveProgress(p); expect(loadProgress()).toEqual(p)
  })
  it('defektes JSON -> leerer Stand', () => {
    localStorage.setItem(KEY, '{kaputt'); expect(loadProgress()).toEqual({ cards: {} })
  })
  it('falsche Form -> leerer Stand', () => {
    localStorage.setItem(KEY, '[1,2]'); expect(loadProgress()).toEqual({ cards: {} })
  })
})
