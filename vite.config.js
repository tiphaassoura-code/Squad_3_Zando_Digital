import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const root = import.meta.dirname

/**
 * Projet multi-pages : chaque écran est un fichier .html à la racine.
 * Ils sont détectés automatiquement, donc une nouvelle page est prise en compte
 * par le build dès sa création — sans rien modifier ici.
 */
const pages = Object.fromEntries(
  readdirSync(root)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace(/\.html$/, ''), resolve(root, file)])
)

export default defineConfig({
  build: {
    rollupOptions: { input: pages }
  },
  server: {
    port: 5173,
    open: '/index.html',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
