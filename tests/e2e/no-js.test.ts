import { test, expect, type Page, type BrowserContext } from '@playwright/test'

/**
 * Progressive-enhancement fallback: with JavaScript disabled, the filter
 * forms must keep working as plain GET forms (visible submit buttons,
 * server-rendered results). Charts (ECharts) are known to need JS — the
 * trends data table is the no-JS fallback there.
 */
test.describe('Without JavaScript', () => {
  let context: BrowserContext
  let page: Page

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ javaScriptEnabled: false })
    page = await context.newPage()
  })

  test.afterEach(async () => {
    await context.close()
  })

  test('suche: results render server-side', async () => {
    await page.goto('/suche?q=NSU')
    await expect(page.locator('text=Ergebnisse')).toBeVisible()
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('suche: full filter round-trip via submit button', async () => {
    await page.goto('/suche')
    // Submit button must be visible (no AutoSubmit to hide it)
    const submit = page.getByRole('button', { name: 'Suchen' })
    await expect(submit).toBeVisible()

    await page.locator('#search-input').fill('NSU')
    await page.locator('select[name="jurisdiction"]').selectOption('Bund')
    await page.locator('input[name="min_year"]').fill('2000')
    await submit.click()

    await expect(page).toHaveURL(/q=NSU/)
    await expect(page).toHaveURL(/jurisdiction=Bund/)
    await expect(page).toHaveURL(/min_year=2000/)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('suche: multiple jurisdictions via the native multi-select', async () => {
    await page.goto('/suche')
    await page.locator('#search-input').fill('Verfassungsschutz')
    // Without JS the jurisdiction control is a native <select multiple>
    await page
      .locator('select[name="jurisdiction"]')
      .selectOption(['Bund', 'Bayern'])
    await page.getByRole('button', { name: 'Suchen' }).click()
    await expect(page).toHaveURL(/jurisdiction=Bund&jurisdiction=Bayern/)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('berichte: type filter via submit button', async () => {
    await page.goto('/berichte')
    await page.locator('select[name="type"]').selectOption('kurzfassung')
    await page.getByRole('button', { name: 'Filtern' }).click()
    await expect(page).toHaveURL(/type=kurzfassung/)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('berichte: jurisdiction grid filter via submit', async () => {
    await page.goto('/berichte')
    await page.locator('select[name="jurisdiction"]').selectOption('Bayern')
    await page.getByRole('button', { name: 'Filtern' }).click()
    await expect(page).toHaveURL(/jurisdiction=Bayern/)
    const rows = page.locator('h2', { hasText: '(seit' })
    await expect(rows).toHaveCount(1)
  })

  test('berichte: year range via number inputs', async () => {
    await page.goto('/berichte?type=alle')
    await page.locator('input[name="min_year"]').fill('2020')
    await page.getByRole('button', { name: 'Filtern' }).click()
    await expect(page).toHaveURL(/min_year=2020/)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('analyse: add term via button shows chart fallback and heatmap', async () => {
    await page.goto('/analyse')
    await page.locator('#term-input').fill('NSU')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()
    await expect(page).toHaveURL(/term=NSU/)
    // Chart needs JS — the collapsible data table is the fallback
    await expect(page.getByText('Daten als Tabelle anzeigen')).toBeVisible()
    // Heatmap is server-rendered
    await expect(page.locator('.heatmap-table')).toBeVisible()
  })

  test('analyse: remove term via pill works', async () => {
    await page.goto('/analyse?q=cyber')
    await page.getByLabel('cyber entfernen').click()
    await expect(page).toHaveURL(/\/analyse$/)
  })

  test('analyse: heatmap fokus switch works via plain links', async () => {
    await page.goto('/analyse?q=NSU&q=NPD')
    await expect(page.getByText(/Erwähnungen von .NSU. nach Region und Jahr/)).toBeVisible()
    await page.getByRole('link', { name: 'NPD', exact: true }).click()
    await expect(page).toHaveURL(/fokus=NPD/)
    await expect(page.getByText(/Erwähnungen von .NPD. nach Region und Jahr/)).toBeVisible()
    await expect(page.locator('.heatmap-table')).toBeVisible()
  })

  test('analyse: year range narrows heatmap via submit', async () => {
    await page.goto('/analyse?q=NSU')
    await page.locator('input[name="min_year"]').fill('2015')
    await page.getByRole('button', { name: 'Hinzufügen' }).click()
    await expect(page).toHaveURL(/min_year=2015/)
    await expect(page.locator('.heatmap-table')).toBeVisible()
  })

  test('homepage search submits as plain GET form', async () => {
    await page.goto('/')
    await page.locator('#search-input').fill('NSU')
    await page.getByRole('button', { name: 'Suchen' }).click()
    await expect(page).toHaveURL(/\/suche\?q=NSU/)
    await expect(page.locator('article').first()).toBeVisible()
  })

  test('navigation and document pages render', async () => {
    await page.goto('/berichte')
    const firstReport = page.locator('a.bg-blue-600').first()
    await expect(firstReport).toBeVisible()
    await firstReport.click()
    await expect(page.locator('h1')).toContainText('Verfassungsschutzbericht')
  })
})
