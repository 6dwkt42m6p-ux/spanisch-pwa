import { readFileSync, readdirSync } from 'node:fs'

const sw = readFileSync('dist/sw.js', 'utf8')
const js = readdirSync('dist/assets').filter((f) => f.endsWith('.js'))
const missing = ['index.html', ...js.map((f) => `assets/${f}`)].filter((f) => !sw.includes(f))
if (missing.length) { console.error('nicht precached:', missing); process.exit(1) }
console.log(`sw ok: ${js.length + 1} Kern-Dateien precached`)
