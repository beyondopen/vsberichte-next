import { defineConfig } from 'vitest/config'
import path from 'path'
import { config } from 'dotenv'

config() // Load .env file

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    environment: 'node',
    testTimeout: 15000,
    // unstable_cache needs a Next server context — pass through in tests
    setupFiles: ['tests/mock-next-cache.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
