import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Terminal from 'vite-plugin-terminal'

export default defineConfig({
  plugins: [
    react(),
    Terminal({
      console: 'terminal',
      output: ['terminal', 'console'],
    }),
  ],
})
