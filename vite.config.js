import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/The-Golf-House/',
  server: {
    port: 5174,
    host: true
  }
})
