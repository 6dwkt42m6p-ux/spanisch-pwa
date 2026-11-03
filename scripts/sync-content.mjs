import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const src = resolve(process.env.SPANISCH_APP_DIR ?? '../SpanischApp', 'data/vocabulary.json')
if (!existsSync(src)) { console.error(`Quelle fehlt: ${src}`); process.exit(1) }
copyFileSync(src, resolve('src/content/vocabulary.json'))
console.log(`synced ${src}`)
