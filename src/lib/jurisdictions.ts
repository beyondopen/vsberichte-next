import { reportInfo } from './report-info'

export const jurisdictions = [
  'Bund',
  ...reportInfo.abbreviations.map(([, name]) => name).sort(),
]

const jurisdictionSet = new Set(jurisdictions)

/**
 * Parse a `jurisdiction` searchParams value (string | string[] | undefined)
 * into a sorted, de-duplicated array of KNOWN jurisdictions.
 *
 * Unknown values are dropped silently — URLs are user-editable, and a bad
 * Behörde already yields zero rows today, never an error. Sorting makes
 * `?jurisdiction=Bayern&jurisdiction=Bund` and the reverse order produce
 * identical query args, which keeps `unstable_cache` keys stable.
 */
export function normalizeJurisdictions(
  raw: string | string[] | undefined
): string[] {
  if (!raw) return []
  const arr = Array.isArray(raw) ? raw : [raw]
  const valid = arr.filter((j) => jurisdictionSet.has(j))
  return Array.from(new Set(valid)).sort()
}

export function jurisdictionToSlug(jurisdiction: string): string {
  return encodeURIComponent(jurisdiction.toLowerCase())
}

export function slugToJurisdiction(slug: string): string {
  const decoded = decodeURIComponent(slug)
  // "baden-württemberg" -> "Baden-Württemberg", "nordrhein-westfalen" -> "Nordrhein-Westfalen"
  // Capitalize the first letter after start-of-string or a hyphen.
  // Uses a simple split approach to avoid \b regex issues with Unicode (ü, ö, etc.)
  return decoded
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}
