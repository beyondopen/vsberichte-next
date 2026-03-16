import { reportInfo } from './report-info'

export const jurisdictions = [
  'Bund',
  ...reportInfo.abbreviations.map(([, name]) => name).sort(),
]

export function jurisdictionToSlug(jurisdiction: string): string {
  return encodeURIComponent(jurisdiction.toLowerCase())
}

export function slugToJurisdiction(slug: string): string {
  const decoded = decodeURIComponent(slug)
  // "baden-württemberg" -> "Baden-Württemberg", "nordrhein-westfalen" -> "Nordrhein-Westfalen"
  // Matches Python's .title() behavior: capitalize first letter of each word
  return decoded.replace(/\b\w/g, c => c.toUpperCase())
}
