import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import flaredriftSite from './site/vite-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), flaredriftSite()],
})
