import { describe, it, expect } from 'vitest'
import './setup'
import { getMentions } from '@/lib/queries/mentions'

describe('mentions queries (integration)', () => {
  it('returns jurisdiction x year matrix for "NSU"', async () => {
    const results = await getMentions('NSU')
    expect(typeof results).toBe('object')

    // Should have jurisdiction keys
    const jurisdictions = Object.keys(results)
    expect(jurisdictions.length).toBeGreaterThan(0)
    expect(jurisdictions).toContain('Bund')
    expect(jurisdictions).toContain('Bayern')
    expect(jurisdictions).toContain('Thüringen')
  })

  it('matrix has year-keyed sub-objects', async () => {
    const results = await getMentions('NSU')
    for (const [jurisdiction, yearMap] of Object.entries(results)) {
      expect(typeof yearMap).toBe('object')
      const years = Object.keys(yearMap).map(Number)
      // Every key should be a plausible year
      for (const y of years) {
        expect(y).toBeGreaterThanOrEqual(1950)
        expect(y).toBeLessThanOrEqual(2100)
      }
    }
  })

  it('values include status codes (-2, -1, 0, or positive numbers)', async () => {
    const results = await getMentions('NSU')
    const allValues = Object.values(results).flatMap(ym => Object.values(ym))
    // At least some -2 (no report published) or -1 (we lack it) should appear
    const hasNeg2 = allValues.some(v => v === -2)
    const hasNeg1 = allValues.some(v => v === -1)
    const hasZero = allValues.some(v => v === 0)
    const hasPositive = allValues.some(v => v > 0)

    // At minimum, we expect positive matches (NSU is in seed data)
    expect(hasPositive).toBe(true)
    // We also expect at least some -2 or -1 since not all jurisdictions have all years
    expect(hasNeg2 || hasNeg1).toBe(true)
    // All values should be valid status codes
    for (const v of allValues) {
      expect(v).toBeGreaterThanOrEqual(-2)
      expect(typeof v).toBe('number')
    }
  })

  it('filters by jurisdiction', async () => {
    const all = await getMentions('Verfassungsschutz')
    const bayernOnly = await getMentions('Verfassungsschutz', { jurisdiction: 'Bayern' })

    // Both should have jurisdiction keys (matrix always includes all jurisdictions)
    expect(Object.keys(bayernOnly).length).toBeGreaterThan(0)

    // Bayern should have positive counts in the filtered result
    const bayernYears = bayernOnly['Bayern']
    if (bayernYears) {
      const bayernPositive = Object.values(bayernYears).some(v => v > 0)
      expect(bayernPositive).toBe(true)
    }
  })

  it('filters by year range', async () => {
    const results = await getMentions('Verfassungsschutz', { minYear: 2020, maxYear: 2023 })
    for (const yearMap of Object.values(results)) {
      const years = Object.keys(yearMap).map(Number)
      for (const y of years) {
        expect(y).toBeGreaterThanOrEqual(2020)
        expect(y).toBeLessThanOrEqual(2023)
      }
    }
  })
})
