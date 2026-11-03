import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BASICS, GRAMMAR, SCENARIOS, VOCAB, categories, inFilter, phrases, scenariosSorted } from './content'

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
  it('Szenarien: Pflichtfelder, Patagonien-Szenarien zuerst (stabil)', () => {
    expect(SCENARIOS.length).toBeGreaterThan(0)
    for (const s of SCENARIOS) {
      expect(s.id && s.title && s.sample_dialogue.length > 0 && s.key_phrases.length > 0, s.id).toBeTruthy()
      if (s.key_phrases_de) expect(s.key_phrases_de).toHaveLength(s.key_phrases.length)
    }
    const sorted = scenariosSorted()
    expect(sorted).toHaveLength(SCENARIOS.length)
    const firstOther = sorted.findIndex((s) => s.region !== 'patagonia')
    expect(sorted.slice(firstOther).every((s) => s.region !== 'patagonia')).toBe(true)
    expect(sorted.filter((s) => s.region !== 'patagonia').map((s) => s.id))
      .toEqual(SCENARIOS.filter((s) => s.region !== 'patagonia').map((s) => s.id))
  })
  it('Grammatik: Pflichtfelder + eindeutige IDs', () => {
    expect(GRAMMAR.length).toBeGreaterThan(0)
    expect(new Set(GRAMMAR.map((g) => g.id)).size).toBe(GRAMMAR.length)
    for (const g of GRAMMAR) expect(g.title && g.explanation && g.level, g.id).toBeTruthy()
  })
  it('Sperrliste: keine persönlichen Daten in gebündelten Inhalten', () => {
    for (const f of ['vocabulary', 'scenarios', 'grammar']) {
      const raw = readFileSync(`src/content/${f}.json`, 'utf8')
      for (const bad of ['Knödler', 'Stuttgart', 'Philipp']) expect(raw.includes(bad), `${f}: ${bad}`).toBe(false)
    }
  })
  for (const f of ['vocabulary', 'scenarios', 'grammar']) {
    const src = resolve(process.env.SPANISCH_APP_DIR ?? '../SpanischApp', `data/${f}.json`)
    it.skipIf(!existsSync(src))(`${f}: Kopie == Quelle (sonst npm run sync-content)`, () => {
      expect(readFileSync(`src/content/${f}.json`, 'utf8')).toBe(readFileSync(src, 'utf8'))
    })
  }
})
