/**
 * Build the target URL for a filter form from its current field values.
 *
 * Mirrors what a native GET submit produces, with the same cleanups the
 * server applies anyway: empty values are omitted, `seite` is reset to
 * page 1 (by dropping it), and an inverted year range is swapped.
 *
 * Pure function — used by AutoSubmit on the client and unit-tested in
 * isolation. Accepts any iterable of [name, value] pairs so both
 * FormData and plain arrays work.
 */
export function buildFilterUrl(
  action: string,
  entries: Iterable<[string, FormDataEntryValue]>
): string {
  const params = new URLSearchParams()

  for (const [name, rawValue] of entries) {
    if (typeof rawValue !== 'string') continue // ignore file inputs
    const value = rawValue.trim()
    if (!value) continue // empty filter = no constraint
    if (name === 'seite') continue // filter change always resets pagination
    params.append(name, value)
  }

  // Drop non-numeric year values (would 500 nothing, but keeps URLs clean)
  for (const key of ['min_year', 'max_year']) {
    const value = params.get(key)
    if (value !== null && !/^\d{4}$/.test(value)) {
      params.delete(key)
    }
  }

  // Swap an inverted year range instead of returning zero results
  const minYear = params.get('min_year')
  const maxYear = params.get('max_year')
  if (minYear !== null && maxYear !== null && parseInt(minYear, 10) > parseInt(maxYear, 10)) {
    params.set('min_year', maxYear)
    params.set('max_year', minYear)
  }

  const qs = params.toString()
  return qs ? `${action}?${qs}` : action
}
