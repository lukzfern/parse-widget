import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// Proxy WarcraftLogs requests through Vite dev server to avoid CORS issues.
// OBS Browser Source points to http://localhost:5173
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/oauth': {
        target: 'https://www.warcraftlogs.com',
        changeOrigin: true,
      },
      '/api/v2': {
        target: 'https://www.warcraftlogs.com',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.d.ts',
        'src/**/index.ts',  // barrel re-export files — no logic to test
        'src/types/**',     // pure TypeScript interface definitions
        'src/App.tsx',      // trivial single-line wrapper
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
})
