import { test, expect } from '@playwright/test'

test.describe('Jurisdiction pages', () => {
  test('shows overview page for Bund', async ({ page }) => {
    await page.goto('/bund')
    await expect(page.locator('h1')).toContainText('Verfassungsschutzberichte Bund')
    // Year grid with available reports
    await expect(page.locator('a.bg-blue-600').first()).toBeVisible()
  })

  test('year cells link to document pages', async ({ page }) => {
    await page.goto('/bund')
    const first = page.locator('a.bg-blue-600').first()
    const href = await first.getAttribute('href')
    expect(href).toMatch(/\/bund\/\d{4}$/)
  })

  test('document page breadcrumb links back to the jurisdiction page', async ({ page }) => {
    await page.goto('/bund')
    await page.locator('a.bg-blue-600').first().click()
    await page.getByRole('link', { name: 'Bund', exact: true }).click()
    await expect(page).toHaveURL(/\/bund$/)
  })

  test('berichte grid headings link to jurisdiction pages', async ({ page }) => {
    await page.goto('/berichte')
    await page.getByRole('link', { name: 'Bund', exact: true }).first().click()
    await expect(page).toHaveURL(/\/bund$/)
    await expect(page.locator('h1')).toContainText('Bund')
  })

  test('full text search link carries the jurisdiction filter', async ({ page }) => {
    await page.goto('/bund')
    await page.getByRole('link', { name: 'Im Volltext durchsuchen' }).click()
    await expect(page).toHaveURL(/\/suche\?jurisdiction=Bund/)
  })

  test('unknown top-level slug returns 404', async ({ page }) => {
    const res = await page.goto('/keine-echte-behoerde')
    expect(res?.status()).toBe(404)
  })
})
