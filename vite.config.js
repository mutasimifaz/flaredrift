import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import flaredriftSite from './site/vite-plugin.mjs'

export default defineConfig({
  plugins: [react(), flaredriftSite()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        mindtrace: resolve(import.meta.dirname, 'mindtrace/index.html'),
      },
    },
  },
})
