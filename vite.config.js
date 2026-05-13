
// https://vite.dev/config/
/*export default defineConfig({
  plugins: [react()],
})*/

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://hunde-la-flota.up.railway.app'
      //'/api': 'http://localhost:3000'
    }
  }
})