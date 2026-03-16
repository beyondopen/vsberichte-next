import { test, expect } from '@playwright/test'

test.describe('Trends', () => {
  test('shows trends page', async ({ page }) => {
    await page.goto('/trends')
    await expect(page.locator('h1')).toContainText('Trends')
  })

  test('shows data when query provided', async ({ page }) => {
    await page.goto('/trends?q=NSU')
    // Should have a term pill
    await expect(page.locator('text=NSU').first()).toBeVisible()
  })
})
