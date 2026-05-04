import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/The-Golf-House/' : '/',
  server: {
    port: Number(process.env.PORT) || 5174,
    host: true
  }
}))
