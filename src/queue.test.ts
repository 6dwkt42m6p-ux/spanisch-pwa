import { describe, expect, it } from 'vitest'
import { buildQueue, requeue, seenCount } from './queue'
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
  it('Basics: Prioritätswörter (essential/Patagonien) zuerst, im Reißverschluss', () => {
    const mk = (id: string, cat: string, tags: string[] = []) => ({ ...v(id, 1, cat), tags })
    const vocab = [mk('a', 'Grundlagen', ['essential']), mk('b', 'Grundlagen', ['essential']), mk('c', 'Zahlen'),
                   mk('p1', 'Patagonien'), mk('p2', 'Patagonien')]
    expect(buildQueue(vocab, {}, '__basics__', T).map((x) => x.id)).toEqual(['a', 'p1', 'b', 'p2', 'c'])
  })
  it('Basics: Überhang einer Gruppe folgt, DE->ES-Neukarten bleiben vorn', () => {
    const mk = (id: string, cat: string, tags: string[] = []) => ({ ...v(id, 1, cat), tags })
    const vocab = [mk('a', 'Grundlagen', ['essential']), mk('p1', 'Patagonien'), mk('p2', 'Patagonien'), mk('c', 'Zahlen')]
    const cards = { 'c|es_de': { ease: 2.5, interval: 1, reps: 1, next: '2026-11-05', last: 3 } }
    expect(buildQueue(vocab, cards, '__basics__', T).map((x) => `${x.id}|${x.dir}`))
      .toEqual(['c|de_es', 'a|es_de', 'p1|es_de', 'p2|es_de'])
  })
  it('Filter Alle: Dateireihenfolge unverändert', () => {
    const vocab = [v('x'), { ...v('y', 1, 'Patagonien') }, v('z')]
    expect(buildQueue(vocab, {}, '__all__', T).map((x) => x.id)).toEqual(['x', 'y', 'z'])
  })
})

describe('seenCount', () => {
  it('zählt Wörter im Filter mit existierender ES->DE-Karte', () => {
    const vocab = [v('a'), v('b'), v('c'), v('d', 2)]
    const cards = {
      'a|es_de': { ease: 2.5, interval: 1, reps: 1, next: T, last: 3 },
      'b|de_es': { ease: 2.5, interval: 1, reps: 1, next: T, last: 3 },
      'd|es_de': { ease: 2.5, interval: 1, reps: 1, next: T, last: 3 },
    }
    expect(seenCount(vocab, cards, '__basics__')).toEqual({ seen: 1, total: 3 })
    expect(seenCount(vocab, cards, '__all__')).toEqual({ seen: 2, total: 4 })
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
