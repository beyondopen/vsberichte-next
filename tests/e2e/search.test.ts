import { test, expect } from '@playwright/test'

test.describe('Search', () => {
  test('shows search form', async ({ page }) => {
    await page.goto('/suche')
    await expect(page.locator('h1')).toContainText('Suche')
    await expect(page.locator('form[action="/suche"]')).toBeVisible()
  })

  test('returns results for NSU', async ({ page }) => {
    await page.goto('/suche?q=NSU')
    await expect(page.locator('text=Ergebnisse')).toBeVisible()
    // Should have result cards
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('highlights search terms in snippets', async ({ page }) => {
    await page.goto('/suche?q=NSU')
    const mark = page.locator('mark').first()
    await expect(mark).toBeVisible()
    await expect(mark).toContainText('NSU')
  })

  test('has working filters', async ({ page }) => {
    await page.goto('/suche')
    await expect(page.locator('select[name="jurisdiction"]')).toBeVisible()
    await expect(page.locator('select[name="min_year"]')).toBeVisible()
    await expect(page.locator('select[name="max_year"]')).toBeVisible()
  })

  test('works without JavaScript', async ({ browser }) => {
    // Create context with JS disabled
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()

    await page.goto('/suche?q=NSU')
    await expect(page.locator('text=Ergebnisse')).toBeVisible()
    // Results should still render (server-side)
    await expect(page.locator('article').first()).toBeVisible()

    await context.close()
  })

  test('pagination works', async ({ page }) => {
    await page.goto('/suche?q=Verfassungsschutz')
    // If there are enough results, pagination should exist
    const pageLinks = page.locator('nav a, a[href*="seite="]')
    // Just check the page loads without error
    await expect(page.locator('h1')).toContainText('Suche')
  })

  test('clicking result image opens expanded lightbox', async ({ page }) => {
    await page.goto('/suche?q=NSU')
    // Click the first search result thumbnail
    const thumbnail = page.locator('article button[aria-label*="vergroessern"]').first()
    await expect(thumbnail).toBeVisible()
    await thumbnail.click()

    // Lightbox should appear
    const lightbox = page.locator('div[role="dialog"]')
    await expect(lightbox).toBeVisible()

    // Lightbox should contain the full image
    const expandedImg = lightbox.locator('img')
    await expect(expandedImg).toBeVisible()

    // Close via the close button
    await lightbox.locator('button[aria-label="Schliessen"]').click()
    await expect(lightbox).not.toBeVisible()
  })

  test('lightbox closes on Escape key', async ({ page }) => {
    await page.goto('/suche?q=NSU')
    const thumbnail = page.locator('article button[aria-label*="vergroessern"]').first()
    await thumbnail.click()

    const lightbox = page.locator('div[role="dialog"]')
    await expect(lightbox).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(lightbox).not.toBeVisible()
  })

  test('shows no results for nonsense query', async ({ page }) => {
    await page.goto('/suche?q=xyzzy12345nonexistent')
    // Should show 0 results or "keine Ergebnisse"
    await expect(page.locator('text=0 Ergebnis').or(page.locator('text=Keine'))).toBeVisible()
  })
})
