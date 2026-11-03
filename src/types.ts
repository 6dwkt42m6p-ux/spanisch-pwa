export type Direction = 'es_de' | 'de_es'

export interface Vocab {
  id: string; spanish: string; german: string; pronunciation: string
  category: string; subcategory: string; example_es: string; example_de: string
  difficulty: number; word_type: string; tags: string[]; south_american_note: string | null
}

export interface CardState {
  ease: number; interval: number; reps: number
  next: string            // ISO-Datum YYYY-MM-DD (lokal)
  last: number | null
}
