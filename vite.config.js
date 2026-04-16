import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/The-Golf-House/' : '/',
  server: {
    port: 5174,
    host: true
  }
}))
