import { unstable_cache } from 'next/cache'

import pool from '@/lib/db'
import { jurisdictions } from '@/lib/jurisdictions'

export interface Document {
  id: number
  year: number
  title: string
  jurisdiction: string
  file_url: string
  num_pages: number
  document_type: string
  language: string
}

export interface DocumentPage {
  id: number
  document_id: number
  page_number: number
  content: string
  file_url: string
}

export interface JurisdictionIndex {
  jurisdiction: string
  years: number[]
}

/**
 * Get all jurisdictions with their available years (descending).
 * Returns the index data and total document count.
 * Optionally filters by document type.
 * Cached: used by the homepage, /berichte, /api and the sitemap; call sites
 * only pass fixed documentType values, so cache keys stay bounded.
 */
export const getIndex = unstable_cache(
  async (documentType?: string): Promise<{ index: JurisdictionIndex[]; total: number }> => {
  let result
  if (documentType) {
    result = await pool.query<{ jurisdiction: string; year: number }>(
      'SELECT jurisdiction, year FROM document WHERE document_type = $1 ORDER BY jurisdiction, year DESC',
      [documentType]
    )
  } else {
    result = await pool.query<{ jurisdiction: string; year: number }>(
      'SELECT jurisdiction, year FROM document ORDER BY jurisdiction, year DESC'
    )
  }

  const byJurisdiction = new Map<string, number[]>()
  for (const row of result.rows) {
    const years = byJurisdiction.get(row.jurisdiction) || []
    years.push(row.year)
    byJurisdiction.set(row.jurisdiction, years)
  }

  const index: JurisdictionIndex[] = jurisdictions.map(j => ({
    jurisdiction: j,
    years: byJurisdiction.get(j) || [],
  }))

  const total = result.rowCount ?? 0
  return { index, total }
  },
  ['document-index'],
  { revalidate: 3600 }
)

export interface DocumentFilter {
  documentType?: string
  language?: string
  jurisdiction?: string
  minYear?: number
  maxYear?: number
}

/**
 * Get documents matching the given filters.
 */
export async function getFilteredDocuments(filters: DocumentFilter = {}): Promise<Document[]> {
  let query = 'SELECT * FROM document WHERE 1=1'
  const params: (string | number)[] = []
  let paramIdx = 1

  if (filters.documentType && filters.documentType !== 'alle') {
    query += ` AND document_type = $${paramIdx++}`
    params.push(filters.documentType)
  }
  if (filters.language) {
    query += ` AND language = $${paramIdx++}`
    params.push(filters.language)
  }
  if (filters.jurisdiction) {
    query += ` AND jurisdiction = $${paramIdx++}`
    params.push(filters.jurisdiction)
  }
  if (filters.minYear) {
    query += ` AND year >= $${paramIdx++}`
    params.push(filters.minYear)
  }
  if (filters.maxYear) {
    query += ` AND year <= $${paramIdx++}`
    params.push(filters.maxYear)
  }

  query += ' ORDER BY year DESC, jurisdiction'
  const { rows } = await pool.query(query, params)
  return rows
}

/**
 * Get a single document by jurisdiction and year.
 */
export async function getDocument(jurisdiction: string, year: number): Promise<Document | null> {
  const result = await pool.query<Document>(
    `SELECT id, year, title, jurisdiction, file_url, num_pages, document_type
     FROM document
     WHERE jurisdiction = $1 AND year = $2
     LIMIT 1`,
    [jurisdiction, year]
  )
  return result.rows[0] ?? null
}

/**
 * Get all pages for a document, ordered by page number.
 */
export async function getDocumentPages(documentId: number): Promise<DocumentPage[]> {
  const result = await pool.query<DocumentPage>(
    `SELECT id, document_id, page_number, content, file_url
     FROM document_page
     WHERE document_id = $1
     ORDER BY page_number`,
    [documentId]
  )
  return result.rows
}

/**
 * Get total number of documents. Cached: rendered on every homepage request.
 */
export const getDocumentCount = unstable_cache(
  async (): Promise<number> => {
    const result = await pool.query<{ count: string }>('SELECT COUNT(*) as count FROM document')
    return parseInt(result.rows[0].count, 10)
  },
  ['document-count'],
  { revalidate: 3600 }
)

/**
 * Get count of distinct jurisdictions that have documents.
 * Cached: rendered on every homepage request.
 */
export const getJurisdictionCount = unstable_cache(
  async (): Promise<number> => {
    const result = await pool.query<{ count: string }>(
      'SELECT COUNT(DISTINCT jurisdiction) as count FROM document'
    )
    return parseInt(result.rows[0].count, 10)
  },
  ['jurisdiction-count'],
  { revalidate: 3600 }
)

/**
 * Get total word count for a document (sum of all token counts).
 */
export async function getWordCount(documentId: number): Promise<number> {
  const result = await pool.query<{ total: string | null }>(
    'SELECT SUM(count) as total FROM token_count WHERE document_id = $1',
    [documentId]
  )
  return parseInt(result.rows[0]?.total ?? '0', 10)
}

/**
 * Get other available years for the same jurisdiction (excludes given year).
 */
export async function getRelatedYears(jurisdiction: string, excludeYear: number): Promise<number[]> {
  const result = await pool.query<{ year: number }>(
    `SELECT year FROM document
     WHERE jurisdiction = $1 AND year != $2
     ORDER BY year DESC`,
    [jurisdiction, excludeYear]
  )
  return result.rows.map(r => r.year)
}

/**
 * Autocomplete suggestions based on token_count table.
 */
export async function getAutocompleteSuggestions(query: string): Promise<string[]> {
  const qList = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (qList.length === 0) return []

  if (
    query.includes('"') ||
    query.includes('(') ||
    query.includes(')') ||
    query.toLowerCase().includes(' and ') ||
    query.toLowerCase().includes(' or ')
  ) {
    return []
  }

  const lastToken = qList[qList.length - 1]

  if (qList.length === 1) {
    const result = await pool.query<{ token: string }>(
      `SELECT DISTINCT token FROM token_count
       WHERE token LIKE $1
       ORDER BY token
       LIMIT 100`,
      [lastToken + '%']
    )
    return result.rows.map(r => r.token).slice(0, 10)
  }

  // Multi-word: ensure previous tokens co-occur in same document
  const previousTokens = qList.slice(0, -1)
  let docIds: Set<number> | null = null

  for (const t of previousTokens) {
    const result = await pool.query<{ document_id: number }>(
      `SELECT DISTINCT document_id FROM token_count WHERE token = $1`,
      [t]
    )
    const ids = new Set(result.rows.map(r => r.document_id))
    if (docIds === null) {
      docIds = ids
    } else {
      const prev: Set<number> = docIds
      docIds = new Set<number>(Array.from(prev).filter(id => ids.has(id)))
    }
  }

  if (!docIds || docIds.size === 0) return []

  const result = await pool.query<{ token: string }>(
    `SELECT DISTINCT token FROM token_count
     WHERE token LIKE $1 AND document_id = ANY($2)
     ORDER BY token
     LIMIT 100`,
    [lastToken + '%', [...docIds]]
  )

  const prefix = previousTokens.join(' ')
  return result.rows.map(r => `${prefix} ${r.token}`).slice(0, 10)
}

/**
 * Get relative frequency stats for trend analysis.
 */
export async function getTermStats(
  query: string,
  params: { jurisdiction?: string | null; minYear?: number | null; maxYear?: number | null } = {}
): Promise<[string, Record<number, number>]> {
  const TRENDS_MIN_YEAR = 1993
  const countingQ = query.replace(/"/g, '').replace(/'/g, '').toLowerCase()

  const conditions: string[] = [
    `dp.search_vector @@ websearch_to_tsquery('pg_catalog.german', $1)`,
    `d.year >= ${TRENDS_MIN_YEAR}`,
  ]
  const queryParams: (string | number)[] = [query]
  let paramIndex = 2

  if (params.jurisdiction) {
    conditions.push(`d.jurisdiction = $${paramIndex}`)
    queryParams.push(params.jurisdiction)
    paramIndex++
  }
  if (params.minYear != null) {
    conditions.push(`d.year >= $${paramIndex}`)
    queryParams.push(params.minYear)
    paramIndex++
  }
  if (params.maxYear != null) {
    conditions.push(`d.year <= $${paramIndex}`)
    queryParams.push(params.maxYear)
    paramIndex++
  }

  const whereClause = conditions.join(' AND ')

  const matchResult = await pool.query<{ year: number; content: string }>(
    `SELECT d.year, dp.content
     FROM document_page dp
     JOIN document d ON dp.document_id = d.id
     WHERE ${whereClause}`,
    queryParams
  )

  const yearCounts: Record<number, number> = {}
  const escaped = countingQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  for (const row of matchResult.rows) {
    const count = (row.content.toLowerCase().match(new RegExp(escaped, 'g')) || []).length
    yearCounts[row.year] = (yearCounts[row.year] || 0) + count
  }

  const totalResult = await pool.query<{ year: number; total: string }>(
    `SELECT d.year, SUM(tc.count) as total
     FROM token_count tc
     JOIN document d ON tc.document_id = d.id
     WHERE d.year >= $1
     GROUP BY d.year`,
    [TRENDS_MIN_YEAR]
  )

  for (const row of totalResult.rows) {
    const total = parseInt(row.total, 10)
    if (yearCounts[row.year] !== undefined && total > 0) {
      yearCounts[row.year] = yearCounts[row.year] / total
    }
    if (yearCounts[row.year] === undefined) {
      yearCounts[row.year] = 0
    }
  }

  if (query.toLowerCase() === 'nsu') {
    for (let y = TRENDS_MIN_YEAR; y < 2009; y++) {
      yearCounts[y] = 0
    }
  }

  return [query, yearCounts]
}

/**
 * Get mention counts by jurisdiction and year for regional heatmap.
 * Returns: { jurisdiction: { year: count } }
 * Status codes: -2 = not published, -1 = we don't have the report, 0+ = count
 */
export async function getMentions(
  query: string,
  params: { jurisdiction?: string | null; minYear?: number | null; maxYear?: number | null } = {}
): Promise<Record<string, Record<number, number>>> {
  const conditions: string[] = [
    `dp.search_vector @@ websearch_to_tsquery('pg_catalog.german', $1)`,
  ]
  const queryParams: (string | number)[] = [query]
  let paramIndex = 2

  if (params.jurisdiction) {
    conditions.push(`d.jurisdiction = $${paramIndex}`)
    queryParams.push(params.jurisdiction)
    paramIndex++
  }

  let minYear = params.minYear ?? null
  let maxYear = params.maxYear ?? null

  if (minYear == null) {
    const r = await pool.query<{ min: number }>('SELECT MIN(year) as min FROM document')
    minYear = r.rows[0].min
  }
  if (maxYear == null) {
    const r = await pool.query<{ max: number }>('SELECT MAX(year) as max FROM document')
    maxYear = r.rows[0].max
  }

  if (params.minYear != null) {
    conditions.push(`d.year >= $${paramIndex}`)
    queryParams.push(params.minYear)
    paramIndex++
  }
  if (params.maxYear != null) {
    conditions.push(`d.year <= $${paramIndex}`)
    queryParams.push(params.maxYear)
    paramIndex++
  }

  const whereClause = conditions.join(' AND ')

  const countResult = await pool.query<{ jurisdiction: string; year: number; count: string }>(
    `SELECT d.jurisdiction, d.year, COUNT(*) as count
     FROM document_page dp
     JOIN document d ON dp.document_id = d.id
     WHERE ${whereClause}
     GROUP BY d.jurisdiction, d.year`,
    queryParams
  )

  const { reportInfo } = await import('@/lib/report-info')

  const results: Record<string, Record<number, number>> = {}

  // Initialize all jurisdictions
  for (const [jurisdiction, startYr] of Object.entries(reportInfo.startYear)) {
    results[jurisdiction] = {}
    for (let y = minYear!; y <= maxYear!; y++) {
      results[jurisdiction][y] = 0
    }
    for (let y = minYear!; y < startYr; y++) {
      results[jurisdiction][y] = -2
    }
  }

  // Mark no-report years
  for (const [jurisdiction, years] of Object.entries(reportInfo.noReports)) {
    for (const y of years) {
      if (results[jurisdiction] && y >= minYear! && y <= maxYear!) {
        results[jurisdiction][y] = -2
      }
    }
  }

  // Check for missing reports (jurisdiction exists but we lack the doc)
  const existingDocs = await pool.query<{ jurisdiction: string; year: number }>(
    'SELECT jurisdiction, year FROM document'
  )
  const docSet = new Set(existingDocs.rows.map(r => `${r.jurisdiction}:${r.year}`))

  for (const jurisdiction of Object.keys(reportInfo.startYear)) {
    if (!results[jurisdiction]) continue
    for (let y = minYear!; y <= maxYear!; y++) {
      if (results[jurisdiction][y] === -2) continue
      if (!docSet.has(`${jurisdiction}:${y}`)) {
        results[jurisdiction][y] = -1
      }
    }
  }

  // Fill in actual counts
  for (const row of countResult.rows) {
    if (results[row.jurisdiction]) {
      results[row.jurisdiction][row.year] = parseInt(row.count, 10)
    }
  }

  return results
}
