import { test, expect } from '@playwright/test'

test.describe('Regional', () => {
  test('shows regional page', async ({ page }) => {
    await page.goto('/regional')
    await expect(page.locator('h1')).toContainText('Regional')
  })

  test('shows heatmap when query provided', async ({ page }) => {
    await page.goto('/regional?q=NSU')
    // Should have a table (the heatmap)
    await expect(page.locator('table').first()).toBeVisible()
  })
})
