import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BASICS, VOCAB, categories, inFilter, phrases } from './content'

describe('content', () => {
  it('Pflichtfelder + eindeutige IDs', () => {
    const ids = new Set<string>()
    for (const v of VOCAB) {
      for (const f of ['id', 'spanish', 'german', 'category', 'word_type'] as const) expect(v[f], `${v.id}.${f}`).toBeTruthy()
      expect(ids.has(v.id)).toBe(false); ids.add(v.id)
    }
    expect(VOCAB.length).toBeGreaterThan(500)
  })
  it('Patagonien vorhanden', () => expect(categories()).toContain('Patagonien'))
  it('Basics = difficulty 1 oder Patagonien', () => {
    for (const v of VOCAB.filter((x) => inFilter(x, BASICS))) expect(v.difficulty === 1 || v.category === 'Patagonien').toBe(true)
  })
  it('Phrasen = word_type phrase oder Patagonien', () => {
    expect(phrases().every((v) => v.word_type === 'phrase' || v.category === 'Patagonien')).toBe(true)
  })
  const src = resolve(process.env.SPANISCH_APP_DIR ?? '../SpanischApp', 'data/vocabulary.json')
  it.skipIf(!existsSync(src))('Kopie == Quelle (sonst npm run sync-content)', () => {
    expect(readFileSync('src/content/vocabulary.json', 'utf8')).toBe(readFileSync(src, 'utf8'))
  })
})
