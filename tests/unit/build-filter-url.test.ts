import { describe, it, expect } from 'vitest'
import { buildFilterUrl } from '@/components/filters/build-filter-url'

describe('buildFilterUrl', () => {
  it('builds a query string from form entries', () => {
    const url = buildFilterUrl('/suche', [
      ['q', 'NPD'],
      ['jurisdiction', 'Bund'],
    ])
    expect(url).toBe('/suche?q=NPD&jurisdiction=Bund')
  })

  it('returns the bare action when all values are empty', () => {
    const url = buildFilterUrl('/suche', [
      ['q', ''],
      ['jurisdiction', ''],
    ])
    expect(url).toBe('/suche')
  })

  it('omits empty and whitespace-only values', () => {
    const url = buildFilterUrl('/suche', [
      ['q', 'NPD'],
      ['jurisdiction', '   '],
      ['min_year', ''],
    ])
    expect(url).toBe('/suche?q=NPD')
  })

  it('always drops seite so filter changes reset pagination', () => {
    const url = buildFilterUrl('/suche', [
      ['q', 'NPD'],
      ['seite', '3'],
    ])
    expect(url).toBe('/suche?q=NPD')
  })

  it('keeps multi-value q params in order (trends)', () => {
    const url = buildFilterUrl('/trends', [
      ['q', 'linksextrem'],
      ['q', 'rechtsextrem'],
      ['term', 'cyber'],
    ])
    expect(url).toBe('/trends?q=linksextrem&q=rechtsextrem&term=cyber')
  })

  it('swaps an inverted year range', () => {
    const url = buildFilterUrl('/berichte', [
      ['min_year', '2020'],
      ['max_year', '2000'],
    ])
    expect(url).toBe('/berichte?min_year=2000&max_year=2020')
  })

  it('keeps a valid year range as-is', () => {
    const url = buildFilterUrl('/berichte', [
      ['min_year', '2000'],
      ['max_year', '2020'],
    ])
    expect(url).toBe('/berichte?min_year=2000&max_year=2020')
  })

  it('drops non-numeric year values', () => {
    const url = buildFilterUrl('/suche', [
      ['q', 'NPD'],
      ['min_year', 'abc'],
      ['max_year', '20'],
    ])
    expect(url).toBe('/suche?q=NPD')
  })

  it('handles a single year bound', () => {
    const url = buildFilterUrl('/suche', [
      ['q', 'NPD'],
      ['min_year', '1990'],
    ])
    expect(url).toBe('/suche?q=NPD&min_year=1990')
  })

  it('encodes special characters', () => {
    const url = buildFilterUrl('/suche', [
      ['q', 'Reichsbürger & Co'],
      ['jurisdiction', 'Baden-Württemberg'],
    ])
    expect(url).toBe(
      '/suche?q=Reichsb%C3%BCrger+%26+Co&jurisdiction=Baden-W%C3%BCrttemberg'
    )
  })

  it('works with a real FormData object', () => {
    const fd = new FormData()
    fd.append('q', 'NPD')
    fd.append('seite', '2')
    fd.append('min_year', '1990')
    expect(buildFilterUrl('/suche', fd)).toBe('/suche?q=NPD&min_year=1990')
  })
})
