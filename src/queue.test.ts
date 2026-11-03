import { describe, expect, it } from 'vitest'
import { buildQueue, requeue } from './queue'
import type { Vocab } from './types'

const v = (id: string, difficulty = 1, category = 'Grundlagen') =>
  ({ id, spanish: id, german: id, pronunciation: '', category, subcategory: '', example_es: '', example_de: '',
     difficulty, word_type: 'noun', tags: [], south_american_note: null }) as Vocab
const T = '2026-11-03'

describe('buildQueue', () => {
  const vocab = Array.from({ length: 30 }, (_, i) => v(`v${i}`))
  it('fällige vor neuen, am stärksten überfällige zuerst', () => {
    const cards = {
      'v5|es_de': { ease: 2.5, interval: 1, reps: 1, next: '2026-11-02', last: 3 },
      'v6|de_es': { ease: 2.5, interval: 1, reps: 1, next: '2026-10-20', last: 3 },
      'v7|es_de': { ease: 2.5, interval: 3, reps: 2, next: '2026-11-10', last: 3 },
    }
    const q = buildQueue(vocab, cards, '__all__', T)
    expect(q.slice(0, 2).map((x) => `${x.id}|${x.dir}`)).toEqual(['v6|de_es', 'v5|es_de'])
    expect(q.some((x) => x.id === 'v7' && x.dir === 'es_de')).toBe(false)
  })
  it('max. 10 neue Karten', () => {
    expect(buildQueue(vocab, {}, '__all__', T)).toHaveLength(10)
  })
  it('neue Wörter erst ES->DE, DE->ES erst wenn ES->DE gelernt', () => {
    const q = buildQueue(vocab, {}, '__all__', T)
    expect(q.every((x) => x.dir === 'es_de')).toBe(true)
    const q2 = buildQueue(vocab, { 'v0|es_de': { ease: 2.5, interval: 1, reps: 1, next: '2026-11-05', last: 3 } }, '__all__', T)
    expect(q2[0]).toEqual({ id: 'v0', dir: 'de_es' })
  })
  it('Filter Basics schließt difficulty 2 außerhalb Patagonien aus', () => {
    const q = buildQueue([v('a', 2), v('b', 2, 'Patagonien'), v('c', 1)], {}, '__basics__', T)
    expect(q.map((x) => x.id).sort()).toEqual(['b', 'c'])
  })
})

describe('requeue', () => {
  it('„Weiß ich nicht“ hängt Karte ans Ende', () => {
    expect(requeue([{ id: 'a', dir: 'es_de' }, { id: 'b', dir: 'es_de' }], false))
      .toEqual([{ id: 'b', dir: 'es_de' }, { id: 'a', dir: 'es_de' }])
  })
  it('„Weiß ich“ entfernt Karte', () => {
    expect(requeue([{ id: 'a', dir: 'es_de' }, { id: 'b', dir: 'es_de' }], true)).toEqual([{ id: 'b', dir: 'es_de' }])
  })
})
