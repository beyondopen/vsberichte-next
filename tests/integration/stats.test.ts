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

  it('getTermStats filters by jurisdiction', async () => {
    const [, allData] = await getTermStats('Verfassungsschutz')
    const [, bayernData] = await getTermStats('Verfassungsschutz', { jurisdiction: 'Bayern' })

    // Bayern-filtered data should have fewer or equal values in each year
    for (const year of Object.keys(bayernData)) {
      const y = Number(year)
      if (allData[y] !== undefined && bayernData[y] > 0) {
        expect(bayernData[y]).toBeLessThanOrEqual(allData[y])
      }
    }
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
})
