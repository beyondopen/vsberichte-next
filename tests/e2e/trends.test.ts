import { test, expect } from '@playwright/test'

test.describe('Trends', () => {
  test('shows trends page', async ({ page }) => {
    await page.goto('/trends')
    await expect(page.locator('h1')).toContainText('Trends')
  })

  test('shows data when query provided', async ({ page }) => {
    await page.goto('/trends?q=NSU')
    // Should have a term pill
    await expect(page.locator('text=NSU').first()).toBeVisible()
  })

  test('adding a term via Enter applies instantly and clears the input', async ({ page }) => {
    await page.goto('/trends')
    const input = page.locator('#term-input')
    await input.fill('cyber')
    await input.press('Enter')
    await expect(page).toHaveURL(/term=cyber/)
    await expect(page.locator('text=cyber').first()).toBeVisible()
    await expect(input).toHaveValue('')
  })

  test('removing a term via its pill works', async ({ page }) => {
    await page.goto('/trends?q=NSU&q=NPD')
    await page.getByLabel('NSU entfernen').click()
    // Exact match: the pre-click URL also contains "q=NPD", so a loose
    // pattern would pass before the navigation happens.
    await expect(page).toHaveURL(/\/trends\?q=NPD$/)
  })

  test('suggestion pills add terms', async ({ page }) => {
    await page.goto('/trends')
    await page.getByRole('link', { name: 'cyber', exact: true }).click()
    await expect(page).toHaveURL(/q=cyber/)
  })
})
