import data from './content/vocabulary.json'
import grammarData from './content/grammar.json'
import scenarioData from './content/scenarios.json'
import type { GrammarLesson, Scenario, Vocab } from './types'

export const VOCAB = data as unknown as Vocab[]
export const SCENARIOS = scenarioData as unknown as Scenario[]
export const GRAMMAR = grammarData as unknown as GrammarLesson[]
export const BASICS = '__basics__'
export const ALL = '__all__'

export function inFilter(v: Vocab, filter: string): boolean {
  if (filter === ALL) return true
  if (filter === BASICS) return v.difficulty === 1 || v.category === 'Patagonien'
  return v.category === filter
}

export function categories(): string[] {
  return [...new Set(VOCAB.map((v) => v.category))].sort((a, b) => a.localeCompare(b, 'de'))
}

export function phrases(): Vocab[] {
  return VOCAB.filter((v) => v.word_type === 'phrase' || v.category === 'Patagonien')
}

/** Patagonien-Szenarien zuerst, sonst Dateireihenfolge. */
export function scenariosSorted(): Scenario[] {
  const pat = SCENARIOS.filter((s) => s.region === 'patagonia')
  return [...pat, ...SCENARIOS.filter((s) => s.region !== 'patagonia')]
}
