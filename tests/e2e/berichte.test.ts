import { test, expect } from '@playwright/test'

test.describe('Berichte', () => {
  test('shows reports grid', async ({ page }) => {
    await page.goto('/berichte')
    await expect(page.locator('h1')).toContainText('Berichte')
  })

  test('has filter bar with dropdowns and year range', async ({ page }) => {
    await page.goto('/berichte')
    await expect(page.locator('select[name="type"]')).toBeVisible()
    await expect(page.locator('select[name="jurisdiction"]')).toBeVisible()
    await expect(page.locator('input[name="min_year"]')).toBeVisible()
    await expect(page.locator('input[name="max_year"]')).toBeVisible()
  })

  test('type select applies instantly without submit', async ({ page }) => {
    await page.goto('/berichte')
    await page.locator('select[name="type"]').selectOption('kurzfassung')
    await expect(page).toHaveURL(/type=kurzfassung/)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('grid filters by jurisdiction', async ({ page }) => {
    await page.goto('/berichte?jurisdiction=Bayern')
    const rows = page.locator('h2', { hasText: '(seit' })
    await expect(rows).toHaveCount(1)
    await expect(rows.first()).toContainText('Bayern')
  })

  test('grid year range restricts year cells instantly', async ({ page }) => {
    await page.goto('/berichte')
    await expect(page.getByText('1995', { exact: true }).first()).toBeVisible()
    const minYear = page.locator('input[name="min_year"]')
    await minYear.fill('2020')
    await minYear.press('Enter')
    await expect(page).toHaveURL(/min_year=2020/)
    await expect(page.getByText('1995', { exact: true })).toHaveCount(0)
  })

  test('language filter switches grid to list view', async ({ page }) => {
    await page.goto('/berichte?language=en')
    // Grid legend is gone in list view
    await expect(page.getByText('Fehlt uns noch')).toHaveCount(0)
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
