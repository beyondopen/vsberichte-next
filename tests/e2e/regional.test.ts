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

  test('exposes the year range filter', async ({ page }) => {
    await page.goto('/regional')
    await expect(page.locator('input[name="min_year"]')).toBeVisible()
    await expect(page.locator('input[name="max_year"]')).toBeVisible()
  })

  test('year filter narrows the heatmap instantly', async ({ page }) => {
    await page.goto('/regional?q=NSU')
    const minYear = page.locator('input[name="min_year"]')
    await minYear.fill('2015')
    await minYear.press('Enter')
    await expect(page).toHaveURL(/min_year=2015/)
    await expect(page.locator('table').first()).toBeVisible()
    // No column header before 2015 (headers show 2-digit years)
    await expect(page.locator('thead th', { hasText: /^14$/ })).toHaveCount(0)
  })
})
