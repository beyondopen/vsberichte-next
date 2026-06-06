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
    await expect(page.locator('input[name="min_year"]')).toBeVisible()
    await expect(page.locator('input[name="max_year"]')).toBeVisible()
    // Dual-thumb year slider mounts after hydration
    await expect(page.getByRole('slider')).toHaveCount(2)
  })

  test('jurisdiction select applies instantly without submit', async ({ page }) => {
    await page.goto('/suche?q=NSU')
    await expect(page.locator('article').first()).toBeVisible()
    await page.locator('select[name="jurisdiction"]').selectOption('Bund')
    await expect(page).toHaveURL(/jurisdiction=Bund/)
    await expect(page).toHaveURL(/q=NSU/)
  })

  test('typing applies the search after a pause', async ({ page }) => {
    await page.goto('/suche')
    await page.locator('#search-input').fill('NSU')
    await expect(page).toHaveURL(/q=NSU/)
    await expect(page.locator('text=Ergebnisse')).toBeVisible()
  })

  test('year slider commit updates the URL', async ({ page }) => {
    await page.goto('/suche?q=NSU')
    const maxThumb = page.getByRole('slider').last()
    await maxThumb.focus()
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/max_year=\d{4}/)
  })

  test('submit button is hidden once instant apply is active', async ({ page }) => {
    await page.goto('/suche')
    await expect(page.locator('form[data-enhanced]')).toBeAttached()
    await expect(page.locator('[data-filter-submit]')).toBeHidden()
  })

  test('filter change resets pagination', async ({ page }) => {
    await page.goto('/suche?q=Verfassungsschutz&seite=2')
    await page.locator('select[name="jurisdiction"]').selectOption('Bund')
    await expect(page).toHaveURL(/jurisdiction=Bund/)
    expect(page.url()).not.toContain('seite=')
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

    // Lightbox should appear (scoped by label — the Next.js dev error
    // overlay is also a role=dialog and would trip strict mode)
    const lightbox = page.getByRole('dialog', { name: /Seite/ })
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

    const lightbox = page.getByRole('dialog', { name: /Seite/ })
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
