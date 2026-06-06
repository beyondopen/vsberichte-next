import { test, expect } from '@playwright/test'

test.describe('Analyse', () => {
  test('shows analyse page', async ({ page }) => {
    await page.goto('/analyse')
    await expect(page.locator('h1')).toContainText('Analyse')
  })

  test('shows chart data when query provided', async ({ page }) => {
    await page.goto('/analyse?q=NSU')
    // Term pill
    await expect(page.locator('text=NSU').first()).toBeVisible()
    // Chart section heading
    await expect(page.getByText('Relative Häufigkeit: NSU')).toBeVisible()
  })

  test('shows heatmap when query provided', async ({ page }) => {
    await page.goto('/analyse?q=NSU')
    // Target the heatmap specifically — the page also contains the
    // collapsed chart data table.
    await expect(page.locator('.heatmap-table')).toBeVisible()
    await expect(page.getByText('nach Region und Jahr')).toBeVisible()
  })

  test('adding a term via Enter applies instantly and clears the input', async ({ page }) => {
    await page.goto('/analyse')
    const input = page.locator('#term-input')
    await input.fill('cyber')
    await input.press('Enter')
    await expect(page).toHaveURL(/term=cyber/)
    await expect(page.locator('text=cyber').first()).toBeVisible()
    await expect(input).toHaveValue('')
  })

  test('removing a term via its pill works', async ({ page }) => {
    await page.goto('/analyse?q=NSU&q=NPD')
    await page.getByLabel('NSU entfernen').click()
    // Exact match: the pre-click URL also contains "q=NPD"
    await expect(page).toHaveURL(/\/analyse\?q=NPD$/)
  })

  test('suggestion pills add terms', async ({ page }) => {
    await page.goto('/analyse')
    await page.getByRole('link', { name: 'cyber', exact: true }).click()
    await expect(page).toHaveURL(/q=cyber/)
  })

  test('year filter narrows the heatmap instantly', async ({ page }) => {
    await page.goto('/analyse?q=NSU')
    const minYear = page.locator('input[name="min_year"]')
    await minYear.fill('2015')
    await minYear.press('Enter')
    await expect(page).toHaveURL(/min_year=2015/)
    await expect(page.locator('.heatmap-table')).toBeVisible()
    // No column header before 2015 (headers show 2-digit years)
    await expect(page.locator('.heatmap-table thead th', { hasText: /^14$/ })).toHaveCount(0)
  })

  test('heatmap fokus defaults to the first term and can be switched', async ({ page }) => {
    await page.goto('/analyse?q=NSU&q=NPD')
    // Default fokus: first term
    await expect(page.getByText(/Erwähnungen von .NSU. nach Region und Jahr/)).toBeVisible()

    // Switch fokus via pill link
    await page.getByRole('link', { name: 'NPD', exact: true }).click()
    await expect(page).toHaveURL(/fokus=NPD/)
    // Both terms stay active
    await expect(page).toHaveURL(/q=NSU&q=NPD/)
    await expect(page.getByText(/Erwähnungen von .NPD. nach Region und Jahr/)).toBeVisible()
  })

  test('/trends redirects permanently to /analyse with params', async ({ page }) => {
    await page.goto('/trends?q=NSU')
    await expect(page).toHaveURL(/\/analyse\?q=NSU$/)
    await expect(page.locator('h1')).toContainText('Analyse')
  })

  test('/regional redirects permanently to /analyse with params', async ({ page }) => {
    await page.goto('/regional?q=NSU&min_year=2010')
    await expect(page).toHaveURL(/\/analyse\?q=NSU&min_year=2010$/)
    await expect(page.locator('.heatmap-table')).toBeVisible()
  })

  test('CSV export link targets the fokus term', async ({ page }) => {
    await page.goto('/analyse?q=NSU&q=NPD&fokus=NPD')
    const csvLink = page.getByRole('link', { name: /Als CSV exportieren/ })
    await expect(csvLink).toHaveAttribute('href', /\/api\/mentions\?q=NPD/)
  })

  test('jurisdiction filter applies to the chart and highlights heatmap rows', async ({ page }) => {
    await page.goto('/analyse?q=NSU')
    // button# matches only the hydrated combobox, not the pre-mount select
    await page.locator('button#filter-jurisdiction').click()
    await page.getByRole('option', { name: 'Bund', exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(page).toHaveURL(/jurisdiction=Bund/)
    // Active terms survive the jurisdiction change
    await expect(page).toHaveURL(/q=NSU/)
    // The matching heatmap row is emphasized; the heatmap itself stays complete
    const highlighted = page.locator('.heatmap-table tbody tr[data-highlighted]')
    await expect(highlighted).toHaveCount(1)
    await expect(highlighted.locator('th')).toContainText('Bund')
    await expect(page.locator('.heatmap-table tbody tr')).not.toHaveCount(1)
  })

  test('fokus switch preserves the jurisdiction selection', async ({ page }) => {
    await page.goto('/analyse?q=NSU&q=NPD&jurisdiction=Bayern')
    await page.getByRole('link', { name: 'NPD', exact: true }).click()
    await expect(page).toHaveURL(/fokus=NPD/)
    await expect(page).toHaveURL(/jurisdiction=Bayern/)
  })

  test('adding a term preserves the jurisdiction selection', async ({ page }) => {
    await page.goto('/analyse?q=NSU&jurisdiction=Bayern')
    const input = page.locator('#term-input')
    await input.fill('cyber')
    await input.press('Enter')
    await expect(page).toHaveURL(/term=cyber/)
    await expect(page).toHaveURL(/jurisdiction=Bayern/)
  })

  test('term input shows suggestions and picking one adds the term', async ({ page }) => {
    await page.goto('/analyse')
    const input = page.locator('#term-input')
    await input.pressSequentially('extrem')
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()
    await listbox.getByRole('option', { name: 'extremismus', exact: true }).click()
    // Picking auto-submits: term added as pill, input cleared for the next one
    await expect(page).toHaveURL(/term=extremismus/)
    await expect(page.getByLabel('extremismus entfernen')).toBeVisible()
    await expect(input).toHaveValue('')
  })
})
