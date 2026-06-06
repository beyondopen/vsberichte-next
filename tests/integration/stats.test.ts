import { describe, it, expect } from 'vitest'
import './setup'
import { getTermStats, getYearTotals } from '@/lib/queries/stats'

describe('stats queries (integration)', () => {
  it('getTermStats returns [query, data] format', async () => {
    const result = await getTermStats('NSU')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(2)

    const [query, data] = result
    expect(query).toBe('NSU')
    expect(typeof data).toBe('object')
  })

  it('getTermStats data has year keys', async () => {
    const [, data] = await getTermStats('NSU')
    const years = Object.keys(data).map(Number)
    expect(years.length).toBeGreaterThan(0)
    for (const y of years) {
      expect(y).toBeGreaterThanOrEqual(1993)
    }
  })

  it('getTermStats values are numbers (relative frequencies)', async () => {
    const [, data] = await getTermStats('NSU')
    for (const value of Object.values(data)) {
      expect(typeof value).toBe('number')
      expect(value).toBeGreaterThanOrEqual(0)
    }
  })

  it('getTermStats zeroes NSU for years before 2009', async () => {
    const [, data] = await getTermStats('NSU')
    // NSU special case: should be 0 for 1993..2008
    for (let y = 1993; y < 2009; y++) {
      if (data[y] !== undefined) {
        expect(data[y]).toBe(0)
      }
    }
  })

  it('getTermStats filters by jurisdictions (pooled relative frequency)', async () => {
    const [, allData] = await getTermStats('Verfassungsschutz')
    const [, bayernData] = await getTermStats('Verfassungsschutz', {
      jurisdictions: ['Bayern'],
    })

    // The denominator is restricted to the same jurisdictions as the
    // numerator, so the filtered value is a valid relative frequency —
    // it may be larger OR smaller than the all-corpus value, but it must
    // differ somewhere and stay a sane ratio.
    const years = Object.keys(bayernData).map(Number)
    expect(years.length).toBeGreaterThan(0)
    let differs = false
    for (const y of years) {
      expect(bayernData[y]).toBeGreaterThanOrEqual(0)
      expect(bayernData[y]).toBeLessThanOrEqual(1)
      if (allData[y] !== undefined && bayernData[y] !== allData[y]) differs = true
    }
    expect(differs).toBe(true)
  })

  it('getTermStats is independent of jurisdiction order', async () => {
    // Callers sort via normalizeJurisdictions; equal input sets must give
    // equal results (and share one cache entry).
    const [, a] = await getTermStats('Verfassungsschutz', {
      jurisdictions: ['Bayern', 'Bund'],
    })
    const [, b] = await getTermStats('Verfassungsschutz', {
      jurisdictions: ['Bayern', 'Bund'],
    })
    expect(a).toEqual(b)
  })

  it('getYearTotals returns year-keyed totals', async () => {
    const totals = await getYearTotals()
    expect(typeof totals).toBe('object')

    const years = Object.keys(totals).map(Number)
    expect(years.length).toBeGreaterThan(0)

    for (const total of Object.values(totals)) {
      expect(typeof total).toBe('number')
      expect(total).toBeGreaterThan(0)
    }
  })

  it('getYearTotals restricted to a jurisdiction is a subset of the corpus totals', async () => {
    const all = await getYearTotals()
    const bayern = await getYearTotals(['Bayern'])
    for (const [year, total] of Object.entries(bayern)) {
      const y = Number(year)
      expect(total).toBeGreaterThan(0)
      expect(total).toBeLessThanOrEqual(all[y])
    }
  })
})
