import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    __DEFINES__: '{}'
  },
  server: {
    port: 5173,
    host: true
  }
})
