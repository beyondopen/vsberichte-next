import pool from '@/lib/db'

export interface SearchResult {
  id: number
  document_id: number
  page_number: number
  content: string
  file_url: string
  year: number
  jurisdiction: string
  doc_file_url: string
  snippets: string[]
  highlight_boxes: { x: number; y: number; w: number; h: number }[]
}

export interface SearchParams {
  jurisdiction?: string | null
  minYear?: number | null
  maxYear?: number | null
  page?: number
  perPage?: number
}

/**
 * Full-text search across document pages using PostgreSQL websearch_to_tsquery.
 * Returns paginated results with ts_headline snippets.
 */
export async function searchDocumentPages(
  query: string,
  params: SearchParams = {}
): Promise<{ results: SearchResult[]; total: number; yearCounts: Record<number, number> }> {
  const { jurisdiction, minYear, maxYear, page = 1, perPage = 20 } = params
  const offset = (page - 1) * perPage

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

  // Count total results
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM document_page dp
     JOIN document d ON dp.document_id = d.id
     WHERE ${whereClause}`,
    queryParams
  )
  const total = parseInt(countResult.rows[0].count, 10)

  // Get year counts
  const yearCountResult = await pool.query<{ year: number; count: string }>(
    `SELECT d.year, COUNT(*) as count
     FROM document_page dp
     JOIN document d ON dp.document_id = d.id
     WHERE ${whereClause}
     GROUP BY d.year`,
    queryParams
  )
  const yearCounts: Record<number, number> = {}
  for (const row of yearCountResult.rows) {
    yearCounts[row.year] = parseInt(row.count, 10)
  }

  // Get paginated results with snippets, ranked by ts_rank
  const searchParams = [...queryParams, perPage, offset]
  const limitIdx = paramIndex
  const offsetIdx = paramIndex + 1

  const searchResult = await pool.query<{
    id: number
    document_id: number
    page_number: number
    content: string
    file_url: string
    year: number
    jurisdiction: string
    doc_file_url: string
    headline: string
  }>(
    `SELECT dp.id, dp.document_id, dp.page_number, dp.content, dp.file_url,
            d.year, d.jurisdiction, d.file_url as doc_file_url,
            ts_headline('pg_catalog.german', dp.content,
              websearch_to_tsquery('pg_catalog.german', $1),
              'MaxFragments=10, MinWords=5, MaxWords=20, FragmentDelimiter=XXX.....XXX') as headline
     FROM document_page dp
     JOIN document d ON dp.document_id = d.id
     WHERE ${whereClause}
     ORDER BY ts_rank(dp.search_vector, websearch_to_tsquery('pg_catalog.german', $1)) DESC
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    searchParams
  )

  const results: SearchResult[] = searchResult.rows.map(row => ({
    id: row.id,
    document_id: row.document_id,
    page_number: row.page_number,
    content: row.content,
    file_url: row.file_url,
    year: row.year,
    jurisdiction: row.jurisdiction,
    doc_file_url: row.doc_file_url,
    snippets: parseSnippets(row.headline),
    highlight_boxes: [],
  }))

  return { results, total, yearCounts }
}

/**
 * Split ts_headline output on the fragment delimiter.
 */
export function parseSnippets(headline: string): string[] {
  return headline.split('XXX.....XXX')
}

/**
 * Extract search tokens from a query string for highlight matching.
 * Strips quotes, parens, and filters out negations and boolean operators.
 */
export function extractSearchTokens(query: string): string[] {
  const cleaned = query
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')

  return cleaned
    .split(/\s+/)
    .filter(t => t.length > 0)
    .filter(t => !t.startsWith('-'))
    .filter(t => !['or', 'and'].includes(t.toLowerCase()))
}
