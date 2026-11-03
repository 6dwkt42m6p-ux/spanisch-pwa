import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dir = process.env.SPANISCH_APP_DIR ?? '../SpanischApp'
const files = ['vocabulary.json', 'scenarios.json', 'grammar.json']
const missing = files.map((f) => resolve(dir, 'data', f)).filter((p) => !existsSync(p))
if (missing.length) { console.error(`Quelle fehlt: ${missing.join(', ')}`); process.exit(1) }
for (const f of files) {
  copyFileSync(resolve(dir, 'data', f), resolve('src/content', f))
  console.log(`synced ${f}`)
}
