import data from './content/vocabulary.json'
import type { Vocab } from './types'

export const VOCAB = data as unknown as Vocab[]
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
