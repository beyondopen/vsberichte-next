import { test, expect } from '@playwright/test'

test.describe('Document Viewer', () => {
  test('shows document details', async ({ page }) => {
    await page.goto('/bund/2023')
    await expect(page.locator('h1')).toContainText('Verfassungsschutzbericht')
    await expect(page.locator('text=Seiten').first()).toBeVisible()
  })

  test('has download buttons', async ({ page }) => {
    await page.goto('/bund/2023')
    await expect(page.locator('text=PDF').first()).toBeVisible()
  })

  test('has back link', async ({ page }) => {
    await page.goto('/bund/2023')
    await expect(page.locator('a[href="/berichte"]').first()).toBeVisible()
  })

  test('returns 404 for non-existent document', async ({ page }) => {
    const response = await page.goto('/bund/1800')
    expect(response?.status()).toBe(404)
  })
})
