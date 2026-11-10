
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import flaredriftSite from './site/vite-plugin.mjs'

export default defineConfig({
  plugins: [
    react(),
    flaredriftSite(),
    {
      name: 'mindtrace-trailing-slash',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/mindtrace' || req.url?.startsWith('/mindtrace?')) {
            const query = req.url.includes('?')
              ? req.url.slice(req.url.indexOf('?'))
              : ''

            res.writeHead(308, {
              Location: `/mindtrace/${query}`,
            })
            res.end()
            return
          }

          next()
        })
      },
    },
  ],

  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        mindtrace: resolve(import.meta.dirname, 'mindtrace/index.html'),
      },
    },
  },
})
