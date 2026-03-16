import { test, expect } from '@playwright/test'

test.describe('API endpoints', () => {
  test('GET /api returns report index', async ({ request }) => {
    const response = await request.get('/api')
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(data.reports).toBeDefined()
    expect(data.total).toBeGreaterThan(0)
    expect(Array.isArray(data.reports)).toBe(true)
  })

  test('GET /api/auto-complete returns suggestions', async ({ request }) => {
    const response = await request.get('/api/auto-complete?q=nsu')
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
  })

  test('GET /stats returns trend data', async ({ request }) => {
    const response = await request.get('/stats?q=NSU')
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(Array.isArray(data)).toBe(true)
  })

  test('GET /api/mentions returns matrix', async ({ request }) => {
    const response = await request.get('/api/mentions?q=NSU')
    expect(response.ok()).toBe(true)
    const data = await response.json()
    expect(typeof data).toBe('object')
  })

  test('GET /api/mentions?csv=1 returns CSV', async ({ request }) => {
    const response = await request.get('/api/mentions?q=NSU&csv=1')
    expect(response.ok()).toBe(true)
    const text = await response.text()
    expect(text).toContain(';')
  })
})
