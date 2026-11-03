import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages liefert unter /<repo-name>/ aus
const base = process.env.GITHUB_ACTIONS ? '/spanisch-pwa/' : '/'

export default defineConfig({
  base,
  test: { environment: 'jsdom', include: ['src/**/*.test.{ts,tsx}'] },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*'],
      manifest: {
        name: 'Español Patagonia',
        short_name: 'Español',
        description: 'Spanisch-Basics offline für Patagonien',
        lang: 'de',
        theme_color: '#14202B',
        background_color: '#14202B',
        display: 'standalone',
        orientation: 'portrait',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
