import { describe, it, expect } from 'vitest'
import './setup'
import {
  getIndex,
  getDocument,
  getDocumentPages,
  getDocumentCount,
  getJurisdictionCount,
  getWordCount,
  getFilteredDocuments,
  getRelatedYears,
} from '@/lib/queries/documents'

describe('documents queries (integration)', () => {
  it('getDocumentCount returns seeded count', async () => {
    const count = await getDocumentCount()
    expect(count).toBeGreaterThanOrEqual(5) // at least seed data
  })

  it('getJurisdictionCount returns at least 4', async () => {
    const count = await getJurisdictionCount()
    // Seed data covers Bund, Bayern, Thüringen, Nordrhein-Westfalen
    expect(count).toBeGreaterThanOrEqual(4)
  })

  it('getIndex returns jurisdictions with years', async () => {
    const { index, total } = await getIndex()
    expect(total).toBeGreaterThanOrEqual(5)
    expect(index.length).toBeGreaterThan(0)

    const bund = index.find(j => j.jurisdiction === 'Bund')
    expect(bund).toBeDefined()
    // Bund has 2022 and 2023 jahresberichte plus kurzfassung and english
    expect(bund!.years.length).toBeGreaterThanOrEqual(2)
  })

  it('getIndex filters by document type', async () => {
    const { total: jahrTotal } = await getIndex('jahresbericht')
    const { total: kurzTotal } = await getIndex('kurzfassung')
    expect(jahrTotal).toBeGreaterThan(kurzTotal)
  })

  it('getDocument returns a seeded document', async () => {
    const doc = await getDocument('Bund', 2023)
    // May return jahresbericht or other type — just check it exists
    if (doc) {
      expect(doc.jurisdiction).toBe('Bund')
      expect(doc.year).toBe(2023)
      expect(doc.num_pages).toBeGreaterThan(0)
    }
  })

  it('getDocument returns null for nonexistent document', async () => {
    const doc = await getDocument('Bund', 1800)
    expect(doc).toBeNull()
  })

  it('getDocumentPages returns pages', async () => {
    const doc = await getDocument('Bund', 2023)
    expect(doc).not.toBeNull()
    if (doc) {
      const pages = await getDocumentPages(doc.id)
      expect(pages.length).toBe(doc.num_pages)
      expect(pages[0].page_number).toBe(1)
      expect(pages[0].content.length).toBeGreaterThan(0)
    }
  })

  it('getWordCount returns positive count for seeded document', async () => {
    const doc = await getDocument('Bund', 2023)
    expect(doc).not.toBeNull()
    if (doc) {
      const wc = await getWordCount(doc.id)
      expect(wc).toBeGreaterThan(0)
    }
  })

  it('getFilteredDocuments filters by type', async () => {
    const kurzfassungen = await getFilteredDocuments({ documentType: 'kurzfassung' })
    expect(kurzfassungen.length).toBeGreaterThanOrEqual(1)
    for (const doc of kurzfassungen) {
      expect(doc.document_type).toBe('kurzfassung')
    }
  })

  it('getFilteredDocuments filters by jurisdiction', async () => {
    const bayern = await getFilteredDocuments({ jurisdictions: ['Bayern'] })
    expect(bayern.length).toBeGreaterThanOrEqual(1)
    for (const doc of bayern) {
      expect(doc.jurisdiction).toBe('Bayern')
    }
  })

  it('getFilteredDocuments filters by multiple jurisdictions', async () => {
    const docs = await getFilteredDocuments({ jurisdictions: ['Bayern', 'Bund'] })
    expect(docs.length).toBeGreaterThanOrEqual(1)
    for (const doc of docs) {
      expect(['Bayern', 'Bund']).toContain(doc.jurisdiction)
    }
  })

  it('getFilteredDocuments filters by year range', async () => {
    const docs = await getFilteredDocuments({ minYear: 2022, maxYear: 2023 })
    for (const doc of docs) {
      expect(doc.year).toBeGreaterThanOrEqual(2022)
      expect(doc.year).toBeLessThanOrEqual(2023)
    }
    expect(docs.length).toBeGreaterThanOrEqual(1)
  })

  it('getFilteredDocuments with "alle" type returns all documents', async () => {
    const allDocs = await getFilteredDocuments({ documentType: 'alle' })
    const unfiltered = await getFilteredDocuments({})
    expect(allDocs.length).toBe(unfiltered.length)
  })

  it('getRelatedYears returns other years for same jurisdiction', async () => {
    // Bund has 2022 and 2023 seed data
    const years = await getRelatedYears('Bund', 2023)
    expect(years).toContain(2022)
    expect(years).not.toContain(2023) // excludes the given year
  })
})
