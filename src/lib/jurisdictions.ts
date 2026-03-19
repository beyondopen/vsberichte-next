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
  // Capitalize the first letter after start-of-string or a hyphen.
  // Uses a simple split approach to avoid \b regex issues with Unicode (ü, ö, etc.)
  return decoded
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}
