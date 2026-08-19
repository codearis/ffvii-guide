import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base para GitHub Pages (codearis.github.io/ffvii-guide)
export default defineConfig({ base: '/ffvii-guide/', plugins: [react()] })
