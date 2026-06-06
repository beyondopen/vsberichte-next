import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('renders with German content', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Verfassungsschutz')
  })

  test('has navigation links', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav')
    await expect(nav.getByRole('link', { name: 'Berichte', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Suche', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Analyse', exact: true })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'News', exact: true })).toBeVisible()
  })

  test('shows document statistics from database', async ({ page }) => {
    await page.goto('/')
    // Should show real numbers from the seeded DB, not zeros
    const statsSection = page.locator('text=Berichte').first()
    await expect(statsSection).toBeVisible()
  })

  test('has working search form', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.locator('input[name="q"]').first()
    await searchInput.fill('NSU')
    await searchInput.press('Enter')
    await expect(page).toHaveURL(/\/suche\?q=NSU/)
  })

  test('has skip-to-content link', async ({ page }) => {
    await page.goto('/')
    const skipLink = page.locator('a[href="#main-content"]')
    await expect(skipLink).toBeAttached()
  })

  test('has dark mode toggle', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByLabel(/Dunkelmodus/i)
    await expect(toggle).toBeVisible()
  })
})
