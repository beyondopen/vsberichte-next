import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3333',
    locale: 'de-DE',
  },
  webServer: {
    command: 'npm run dev -- --port 3333',
    port: 3333,
    reuseExistingServer: true,
    timeout: 30000,
  },
})
