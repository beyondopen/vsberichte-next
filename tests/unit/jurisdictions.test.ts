import { describe, it, expect } from 'vitest'
import {
  jurisdictions,
  jurisdictionToSlug,
  slugToJurisdiction,
  normalizeJurisdictions,
} from '@/lib/jurisdictions'

describe('jurisdictions', () => {
  it('starts with "Bund"', () => {
    expect(jurisdictions[0]).toBe('Bund')
  })

  it('has 17 entries (Bund + 16 Laender)', () => {
    expect(jurisdictions).toHaveLength(17)
  })

  it('entries after Bund are alphabetically sorted', () => {
    const laender = jurisdictions.slice(1)
    const sorted = [...laender].sort()
    expect(laender).toEqual(sorted)
  })
})

describe('jurisdictionToSlug', () => {
  it('converts "Baden-Württemberg" to correct encoded slug', () => {
    const slug = jurisdictionToSlug('Baden-Württemberg')
    expect(slug).toBe('baden-w%C3%BCrttemberg')
  })

  it('converts "Bund" to "bund"', () => {
    expect(jurisdictionToSlug('Bund')).toBe('bund')
  })

  it('lowercases simple names', () => {
    expect(jurisdictionToSlug('Bayern')).toBe('bayern')
  })
})

describe('slugToJurisdiction', () => {
  it('converts "bund" to "Bund"', () => {
    expect(slugToJurisdiction('bund')).toBe('Bund')
  })

  it('converts encoded slug back to "Baden-Württemberg"', () => {
    const result = slugToJurisdiction('baden-w%C3%BCrttemberg')
    expect(result).toBe('Baden-Württemberg')
  })

  it('capitalizes first letter of each word', () => {
    expect(slugToJurisdiction('nordrhein-westfalen')).toBe('Nordrhein-Westfalen')
  })
})

describe('round-trip slug conversion', () => {
  it('preserves jurisdiction for all entries', () => {
    for (const j of jurisdictions) {
      expect(slugToJurisdiction(jurisdictionToSlug(j))).toBe(j)
    }
  })

  it('round-trips "Baden-Württemberg" correctly', () => {
    const original = 'Baden-Württemberg'
    const roundTripped = slugToJurisdiction(jurisdictionToSlug(original))
    expect(roundTripped).toBe('Baden-Württemberg')
  })
})

describe('normalizeJurisdictions', () => {
  it('returns [] for undefined and empty string', () => {
    expect(normalizeJurisdictions(undefined)).toEqual([])
    expect(normalizeJurisdictions('')).toEqual([])
  })

  it('wraps a single legacy value in an array', () => {
    expect(normalizeJurisdictions('Bayern')).toEqual(['Bayern'])
  })

  it('accepts repeated params as an array', () => {
    expect(normalizeJurisdictions(['Bund', 'Bayern'])).toEqual(['Bayern', 'Bund'])
  })

  it('sorts for cache-key stability regardless of param order', () => {
    expect(normalizeJurisdictions(['Bund', 'Bayern'])).toEqual(
      normalizeJurisdictions(['Bayern', 'Bund'])
    )
  })

  it('drops unknown values silently', () => {
    expect(normalizeJurisdictions(['Bayern', 'Atlantis'])).toEqual(['Bayern'])
    expect(normalizeJurisdictions('Atlantis')).toEqual([])
  })

  it('de-duplicates', () => {
    expect(normalizeJurisdictions(['Bund', 'Bund'])).toEqual(['Bund'])
  })
})
