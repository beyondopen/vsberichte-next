import { unstable_cache } from 'next/cache'

import pool from '@/lib/db'

/** Minimum year for trend analysis (need sufficient data coverage) */
const TRENDS_MIN_YEAR = 1993

/**
 * Get total token counts per year (for normalizing relative frequencies),
 * optionally restricted to a set of jurisdictions — the denominator must
 * cover the same corpus slice as the numerator, otherwise the "relative"
 * frequency would shrink just because fewer jurisdictions are selected.
 * Cached: aggregates over the full token_count table (millions of rows) and
 * runs inside every getTermStats call; the data only changes on imports.
 */
export const getYearTotals = unstable_cache(
  async (jurisdictions: string[] = []): Promise<Record<number, number>> => {
    const params: (number | string[])[] = [TRENDS_MIN_YEAR]
    let jurisdictionClause = ''
    if (jurisdictions.length > 0) {
      // pg binds a JS string array as a single text[] parameter
      jurisdictionClause = ` AND d.jurisdiction = ANY($2::text[])`
      params.push(jurisdictions)
    }
    const result = await pool.query<{ year: number; total: string }>(
      `SELECT d.year, SUM(tc.count) as total
       FROM token_count tc
       JOIN document d ON tc.document_id = d.id
       WHERE d.year >= $1${jurisdictionClause}
       GROUP BY d.year`,
      params
    )

    const totals: Record<number, number> = {}
    for (const row of result.rows) {
      totals[row.year] = parseInt(row.total, 10)
    }
    return totals
  },
  ['year-totals'],
  { revalidate: 3600, tags: ['corpus'] }
)

export interface TermStatsParams {
  /**
   * Empty array = no constraint. Callers must pass the SORTED output of
   * normalizeJurisdictions — the args are the unstable_cache key, so
   * param order must not fragment the cache.
   */
  jurisdictions?: string[]
  minYear?: number | null
  maxYear?: number | null
}

/**
 * Get relative frequency of a search term per year.
 * Returns [query, { year: relativeFrequency }].
 * Cached per term+params combination; the underlying corpus only changes
 * when new reports are imported.
 */
export const getTermStats = unstable_cache(
  async (
    query: string,
    params: TermStatsParams = {}
  ): Promise<[string, Record<number, number>]> => {
  const { jurisdictions = [], minYear, maxYear } = params

  // Build WHERE conditions for the search
  const conditions: string[] = [
    `dp.search_vector @@ websearch_to_tsquery('pg_catalog.german', $1)`,
    `d.year >= $2`,
  ]
  const queryParams: (string | number | string[])[] = [query, TRENDS_MIN_YEAR]
  let paramIndex = 3

  if (jurisdictions.length > 0) {
    conditions.push(`d.jurisdiction = ANY($${paramIndex}::text[])`)
    queryParams.push(jurisdictions)
    paramIndex++
  }
  if (minYear != null) {
    conditions.push(`d.year >= $${paramIndex}`)
    queryParams.push(minYear)
    paramIndex++
  }
  if (maxYear != null) {
    conditions.push(`d.year <= $${paramIndex}`)
    queryParams.push(maxYear)
    paramIndex++
  }

  const whereClause = conditions.join(' AND ')

  // Get matching pages with year and content
  const result = await pool.query<{ year: number; content: string }>(
    `SELECT d.year, dp.content
     FROM document_page dp
     JOIN document d ON dp.document_id = d.id
     WHERE ${whereClause}`,
    queryParams
  )

  // Count occurrences of the query term in matched content per year
  // Strip quotes for counting (matching Flask behavior)
  const countingQuery = query.replace(/"/g, '').replace(/'/g, '').toLowerCase()
  const yearCounts: Record<number, number> = {}

  for (const row of result.rows) {
    const count = countOccurrences(row.content.toLowerCase(), countingQuery)
    yearCounts[row.year] = (yearCounts[row.year] || 0) + count
  }

  // Normalize by year totals over the same jurisdiction slice (pooled
  // relative frequency: the selection is treated as one combined corpus)
  const yearTotals = await getYearTotals(jurisdictions)
  for (const [year, total] of Object.entries(yearTotals)) {
    const y = parseInt(year, 10)
    if (yearCounts[y] !== undefined) {
      yearCounts[y] /= total
    }
  }

  // Special case: NSU was not a term before 2009
  if (query.toLowerCase() === 'nsu') {
    for (let y = TRENDS_MIN_YEAR; y < 2009; y++) {
      yearCounts[y] = 0
    }
  }

  return [query, yearCounts]
  },
  ['term-stats'],
  { revalidate: 3600, tags: ['corpus'] }
)

function countOccurrences(text: string, term: string): number {
  let count = 0
  let pos = 0
  while ((pos = text.indexOf(term, pos)) !== -1) {
    count++
    pos += term.length
  }
  return count
}
