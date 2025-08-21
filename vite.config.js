import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/furigana-generator/',
  plugins: [react()],
  resolve: {
    alias: {
      path: 'path-browserify'
    }
  }
})
