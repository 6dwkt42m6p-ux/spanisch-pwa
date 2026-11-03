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

export interface DialogueLine { role: string; text: string; text_de?: string }

export interface Scenario {
  id: string; title: string; icon: string; difficulty: number; description: string; context: string
  key_vocabulary: string[]; key_phrases: string[]; key_phrases_de?: string[]
  sample_dialogue: DialogueLine[]; cultural_notes?: string[]; region?: string
}

export interface ConjRow { person: string; form: string; german: string }
export interface ConjTable { verb: string; type: string; rows: ConjRow[] }
export interface Example { es: string; de: string }

/** Lektionen sind uneinheitlich; nur die Kernfelder sind garantiert, der Rest optional. */
export interface GrammarLesson {
  id: string; title: string; subtitle: string; level: number; explanation: string
  conjugation_tables?: ConjTable[]; examples?: Example[]; travel_tip?: string | null
  memory_trick?: string; voseo_rule?: string; preterite_vs_imperfect?: string
  time_markers?: string[]; essential_travel_questions?: string[]
  question_words?: { word: string; german: string; example_es: string; example_de: string }[]
  key_forms?: { form: string; base: string; german: string; example_es: string; example_de: string }[]
  key_constructions?: { pattern: string; german: string; examples: Example[] }[]
  comparison_table?: { tú_form: string; vos_form: string; german: string }[]
  negation_patterns?: { pattern: string; example_es: string; example_de: string }[]
  useful_phrases?: Example[]
}
