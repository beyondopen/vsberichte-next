import { describe, it, expect } from 'vitest'
import './setup'
import { searchDocumentPages } from '@/lib/queries/search'

describe('search queries (integration)', () => {
  it('finds NSU in seeded data', async () => {
    const { results, total } = await searchDocumentPages('NSU')
    expect(total).toBeGreaterThan(0)
    expect(results.length).toBeGreaterThan(0)
    // Check snippets contain highlight markers (ts_headline wraps matches in <b>)
    const allSnippets = results.flatMap(r => r.snippets)
    const hasHighlight = allSnippets.some(s => s.includes('<b>'))
    expect(hasHighlight).toBe(true)
  })

  it('returns empty for nonsense query', async () => {
    const { results, total } = await searchDocumentPages('xyzzy12345nonexistent')
    expect(total).toBe(0)
    expect(results.length).toBe(0)
  })

  it('filters by jurisdiction', async () => {
    const { results } = await searchDocumentPages('Verfassungsschutz', {
      jurisdictions: ['Bayern'],
    })
    for (const r of results) {
      expect(r.jurisdiction).toBe('Bayern')
    }
  })

  it('filters by multiple jurisdictions', async () => {
    const { results, total } = await searchDocumentPages('Verfassungsschutz', {
      jurisdictions: ['Bayern', 'Bund'],
    })
    for (const r of results) {
      expect(['Bayern', 'Bund']).toContain(r.jurisdiction)
    }
    // Superset of the single-jurisdiction result
    const { total: bayernTotal } = await searchDocumentPages('Verfassungsschutz', {
      jurisdictions: ['Bayern'],
    })
    expect(total).toBeGreaterThanOrEqual(bayernTotal)
  })

  it('treats an empty jurisdictions array as no constraint', async () => {
    const { total: allTotal } = await searchDocumentPages('Verfassungsschutz')
    const { total: emptyTotal } = await searchDocumentPages('Verfassungsschutz', {
      jurisdictions: [],
    })
    expect(emptyTotal).toBe(allTotal)
  })

  it('filters by year range', async () => {
    const { results } = await searchDocumentPages('Verfassungsschutz', { minYear: 2023, maxYear: 2023 })
    for (const r of results) {
      expect(r.year).toBe(2023)
    }
  })

  it('paginates correctly', async () => {
    const { results: page1 } = await searchDocumentPages('Verfassungsschutz', { page: 1, perPage: 2 })
    expect(page1.length).toBeLessThanOrEqual(2)

    if (page1.length === 2) {
      const { results: page2 } = await searchDocumentPages('Verfassungsschutz', { page: 2, perPage: 2 })
      // Page 2 results should differ from page 1
      if (page2.length > 0) {
        const page1Ids = new Set(page1.map(r => r.id))
        const overlap = page2.filter(r => page1Ids.has(r.id))
        expect(overlap.length).toBe(0)
      }
    }
  })

  it('returns yearCounts alongside results', async () => {
    const { yearCounts, total } = await searchDocumentPages('Verfassungsschutz')
    if (total > 0) {
      const years = Object.keys(yearCounts).map(Number)
      expect(years.length).toBeGreaterThan(0)
      for (const count of Object.values(yearCounts)) {
        expect(count).toBeGreaterThan(0)
      }
    }
  })

  it('respects default perPage of 20', async () => {
    const { results } = await searchDocumentPages('Verfassungsschutz', { page: 1 })
    expect(results.length).toBeLessThanOrEqual(20)
  })
})
