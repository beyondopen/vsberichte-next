import { test, expect } from '@playwright/test'

test.describe('Berichte', () => {
  test('shows reports grid', async ({ page }) => {
    await page.goto('/berichte')
    await expect(page.locator('h1')).toContainText('Berichte')
  })

  test('has filter bar with dropdowns', async ({ page }) => {
    await page.goto('/berichte')
    await expect(page.locator('select[name="type"]')).toBeVisible()
    await expect(page.locator('select[name="jurisdiction"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('default shows Jahresbericht grid with year cells', async ({ page }) => {
    await page.goto('/berichte')
    // Should have blue year cells (links)
    await expect(page.locator('a.bg-blue-600').first()).toBeVisible()
  })

  test('filter by Kurzfassung shows card view', async ({ page }) => {
    await page.goto('/berichte?type=kurzfassung')
    // Should show card view with article cards
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('filter by alle shows all types', async ({ page }) => {
    await page.goto('/berichte?type=alle')
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('year cells link to document viewer', async ({ page }) => {
    await page.goto('/berichte')
    const firstLink = page.locator('a.bg-blue-600').first()
    const href = await firstLink.getAttribute('href')
    expect(href).toMatch(/\/[a-z].*\/\d{4}/)
  })
})
