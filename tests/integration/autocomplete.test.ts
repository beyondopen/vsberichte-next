import { describe, it, expect } from 'vitest'
import './setup'
import { getAutocompleteSuggestions } from '@/lib/queries/autocomplete'

describe('autocomplete queries (integration)', () => {
  it('returns suggestions for "nsu"', async () => {
    const suggestions = await getAutocompleteSuggestions('nsu')
    expect(suggestions.length).toBeGreaterThan(0)
    // Every suggestion should start with "nsu"
    for (const s of suggestions) {
      expect(s.toLowerCase().startsWith('nsu')).toBe(true)
    }
  })

  it('returns suggestions for "verfassungsschutz"', async () => {
    const suggestions = await getAutocompleteSuggestions('verfassungsschutz')
    expect(suggestions.length).toBeGreaterThan(0)
  })

  it('returns empty for empty string', async () => {
    const suggestions = await getAutocompleteSuggestions('')
    expect(suggestions).toEqual([])
  })

  it('returns empty for whitespace-only string', async () => {
    const suggestions = await getAutocompleteSuggestions('   ')
    expect(suggestions).toEqual([])
  })

  it('returns empty for queries with double quotes', async () => {
    const suggestions = await getAutocompleteSuggestions('"extremismus"')
    expect(suggestions).toEqual([])
  })

  it('returns empty for queries with parentheses', async () => {
    const suggestions = await getAutocompleteSuggestions('(test)')
    expect(suggestions).toEqual([])
  })

  it('returns empty for queries with boolean operators', async () => {
    const andSuggestions = await getAutocompleteSuggestions('nsu and bnd')
    expect(andSuggestions).toEqual([])

    const orSuggestions = await getAutocompleteSuggestions('nsu or bnd')
    expect(orSuggestions).toEqual([])
  })

  it('returns at most 10 suggestions', async () => {
    const suggestions = await getAutocompleteSuggestions('d')
    expect(suggestions.length).toBeLessThanOrEqual(10)
  })

  it('handles multi-token queries', async () => {
    // "nsu komplex" - "nsu" must exist as a token, then prefix-match on "komplex"
    const suggestions = await getAutocompleteSuggestions('nsu k')
    // Each suggestion should start with "nsu "
    for (const s of suggestions) {
      expect(s.toLowerCase().startsWith('nsu ')).toBe(true)
    }
  })
})
