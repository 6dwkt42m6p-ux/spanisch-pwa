import { inFilter } from './content'
import { cardKey } from './store'
import type { CardState, Direction, Vocab } from './types'

export interface QItem { id: string; dir: Direction }
export const NEW_PER_ROUND = 10

const daysBetween = (a: string, b: string) =>
  Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)

/** Fällige Karten (überfälligste zuerst, dann niedrige Ease), danach max. 10 neue. */
export function buildQueue(vocab: Vocab[], cards: Record<string, CardState>, filter: string, today: string): QItem[] {
  const due: { item: QItem; over: number; ease: number }[] = []
  const fresh: QItem[] = []
  for (const v of vocab) {
    if (!inFilter(v, filter)) continue
    for (const dir of ['es_de', 'de_es'] as Direction[]) {
      const c = cards[cardKey(v.id, dir)]
      if (c) {
        if (c.next <= today) due.push({ item: { id: v.id, dir }, over: daysBetween(c.next, today), ease: c.ease })
      } else if (dir === 'es_de' || cards[cardKey(v.id, 'es_de')]) {
        fresh.push({ id: v.id, dir })
      }
    }
  }
  due.sort((a, b) => b.over - a.over || a.ease - b.ease)
  // DE->ES-Neukarten (Wort schon bekannt) vor komplett neuen Wörtern
  fresh.sort((a, b) => (a.dir === b.dir ? 0 : a.dir === 'de_es' ? -1 : 1))
  return [...due.map((d) => d.item), ...fresh.slice(0, NEW_PER_ROUND)]
}

export function requeue(queue: QItem[], known: boolean): QItem[] {
  const [head, ...rest] = queue
  return known || !head ? rest : [...rest, head]
}
