import pool from '@/lib/db'

/**
 * Get autocomplete suggestions for a search query.
 * Matches the Flask api_search_auto() behavior:
 * - For single tokens: prefix match on token_count table
 * - For multi-token queries: prefix match on last token, filtered to documents
 *   containing all previous tokens
 */
export async function getAutocompleteSuggestions(
  query: string,
  limit = 10
): Promise<string[]> {
  const qOrig = query.toLowerCase().trim()
  if (qOrig === '') return []

  // Skip complex queries (quotes, boolean operators, parens)
  if (
    qOrig.includes('"') ||
    qOrig.includes(' and ') ||
    qOrig.includes(' or ') ||
    qOrig.includes('(') ||
    qOrig.includes(')')
  ) {
    return []
  }

  const qList = qOrig.split(/\s+/)
  const lastToken = qList[qList.length - 1]

  let tokens: string[]

  if (qList.length === 1) {
    // Single token: simple prefix match
    const result = await pool.query<{ token: string }>(
      `SELECT DISTINCT token FROM token_count
       WHERE token LIKE $1
       ORDER BY token
       LIMIT 100`,
      [lastToken + '%']
    )
    tokens = result.rows.map(r => r.token)
  } else {
    // Multi-token: filter to documents containing all previous tokens
    const previousTokens = qList.slice(0, -1)

    // Find document IDs that contain ALL previous tokens
    // Build intersection query
    const conditions = previousTokens.map(
      (_, i) => `document_id IN (SELECT document_id FROM token_count WHERE token = $${i + 1})`
    )
    const params: (string | number)[] = [...previousTokens, lastToken + '%']

    const result = await pool.query<{ token: string }>(
      `SELECT DISTINCT token FROM token_count
       WHERE token LIKE $${previousTokens.length + 1}
         AND ${conditions.join(' AND ')}
       ORDER BY token
       LIMIT 100`,
      params
    )
    tokens = result.rows.map(r => r.token)
  }

  // Deduplicate while preserving order, take the top `limit`
  const unique: string[] = []
  for (const t of tokens) {
    if (!unique.includes(t)) {
      unique.push(t)
    }
    if (unique.length >= limit) break
  }

  // Prepend previous tokens for multi-token queries
  const prefix = qList.length > 1 ? qList.slice(0, -1).join(' ') + ' ' : ''
  return unique.map(t => prefix + t)
}
