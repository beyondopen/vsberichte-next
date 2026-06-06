import { unstable_cache } from 'next/cache'

import pool from '@/lib/db'
import { reportInfo } from '@/lib/report-info'

export interface MentionsParams {
  jurisdiction?: string | null
  minYear?: number | null
  maxYear?: number | null
}

/**
 * Get a jurisdiction x year matrix of search result counts.
 *
 * Values:
 *  -2 = no report was published that year
 *  -1 = we don't have the published report
 *   0 = report exists but no matches
 *   N = number of matching pages
 *
 * Cached per term+params combination; the underlying corpus only changes
 * when new reports are imported.
 */
export const getMentions = unstable_cache(
  async (
    query: string,
    params: MentionsParams = {}
  ): Promise<Record<string, Record<number, number>>> => {
  const { jurisdiction, minYear: paramMinYear, maxYear: paramMaxYear } = params

  // Determine year range
  let minYear = paramMinYear
  let maxYear = paramMaxYear

  if (minYear == null) {
    const result = await pool.query<{ min: number }>('SELECT MIN(year) as min FROM document')
    minYear = result.rows[0]?.min ?? 1968
  }
  if (maxYear == null) {
    const result = await pool.query<{ max: number }>('SELECT MAX(year) as max FROM document')
    maxYear = result.rows[0]?.max ?? new Date().getFullYear()
  }

  // Build WHERE conditions
  const conditions: string[] = [
    `dp.search_vector @@ websearch_to_tsquery('pg_catalog.german', $1)`,
  ]
  const queryParams: (string | number)[] = [query]
  let paramIndex = 2

  if (jurisdiction) {
    conditions.push(`d.jurisdiction = $${paramIndex}`)
    queryParams.push(jurisdiction)
    paramIndex++
  }
  if (paramMinYear != null) {
    conditions.push(`d.year >= $${paramIndex}`)
    queryParams.push(paramMinYear)
    paramIndex++
  }
  if (paramMaxYear != null) {
    conditions.push(`d.year <= $${paramIndex}`)
    queryParams.push(paramMaxYear)
    paramIndex++
  }

  const whereClause = conditions.join(' AND ')

  // Get mention counts grouped by jurisdiction and year
  const countResult = await pool.query<{ jurisdiction: string; year: number; count: string }>(
    `SELECT d.jurisdiction, d.year, COUNT(*) as count
     FROM document_page dp
     JOIN document d ON dp.document_id = d.id
     WHERE ${whereClause}
     GROUP BY d.jurisdiction, d.year`,
    queryParams
  )

  // Get all documents to know which reports we have
  const docsResult = await pool.query<{ jurisdiction: string; year: number }>(
    'SELECT jurisdiction, year FROM document'
  )
  const existingDocs = new Set(docsResult.rows.map(r => `${r.jurisdiction}:${r.year}`))

  // Initialize results matrix
  const results: Record<string, Record<number, number>> = {}

  for (const [jur, startYr] of Object.entries(reportInfo.startYear)) {
    results[jur] = {}

    // Initialize all years
    for (let y = minYear; y <= maxYear; y++) {
      results[jur][y] = 0
    }

    // Mark years before jurisdiction started publishing
    for (let y = minYear; y < startYr; y++) {
      results[jur][y] = -2
    }
  }

  // Mark years where no report was published
  for (const [jur, years] of Object.entries(reportInfo.noReports)) {
    if (!results[jur]) continue

    // Mark missing reports (we don't have them)
    for (let y = minYear; y <= maxYear; y++) {
      if (results[jur][y] !== -2 && !existingDocs.has(`${jur}:${y}`)) {
        results[jur][y] = -1
      }
    }

    // Mark years with no report published
    for (const y of years) {
      if (y >= minYear && y <= maxYear) {
        results[jur][y] = -2
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
  },
  ['mentions'],
  { revalidate: 3600, tags: ['corpus'] }
)
