import { describe, it, expect } from 'vitest'
import { parseSnippets, extractSearchTokens } from '@/lib/queries/search'

describe('parseSnippets', () => {
  it('splits on XXX.....XXX delimiter', () => {
    const result = parseSnippets('foo XXX.....XXX bar')
    expect(result).toEqual(['foo ', ' bar'])
  })

  it('returns single-element array for text without delimiter', () => {
    const result = parseSnippets('single fragment')
    expect(result).toEqual(['single fragment'])
  })

  it('handles empty string', () => {
    const result = parseSnippets('')
    expect(result).toEqual([''])
  })

  it('handles multiple delimiters', () => {
    const result = parseSnippets('first XXX.....XXX second XXX.....XXX third')
    expect(result).toEqual(['first ', ' second ', ' third'])
  })

  it('handles delimiter at start', () => {
    const result = parseSnippets('XXX.....XXX after')
    expect(result).toEqual(['', ' after'])
  })

  it('handles delimiter at end', () => {
    const result = parseSnippets('before XXX.....XXX')
    expect(result).toEqual(['before ', ''])
  })
})

describe('extractSearchTokens', () => {
  it('extracts a simple term', () => {
    expect(extractSearchTokens('NSU')).toEqual(['NSU'])
  })

  it('strips quotes and returns individual words', () => {
    expect(extractSearchTokens('"kommunistische partei"')).toEqual([
      'kommunistische',
      'partei',
    ])
  })

  it('strips OR operator', () => {
    expect(extractSearchTokens('links OR rechts')).toEqual(['links', 'rechts'])
  })

  it('strips AND operator', () => {
    expect(extractSearchTokens('links AND rechts')).toEqual(['links', 'rechts'])
  })

  it('strips negations (words starting with -)', () => {
    expect(extractSearchTokens('-nicht das')).toEqual(['das'])
  })

  it('strips parentheses and OR operators together', () => {
    expect(extractSearchTokens('(links OR rechts) kind')).toEqual([
      'links',
      'rechts',
      'kind',
    ])
  })

  it('handles empty string', () => {
    expect(extractSearchTokens('')).toEqual([])
  })

  it('handles multiple spaces', () => {
    expect(extractSearchTokens('  foo   bar  ')).toEqual(['foo', 'bar'])
  })

  it('strips single quotes', () => {
    expect(extractSearchTokens("'test phrase'")).toEqual(['test', 'phrase'])
  })

  it('is case-insensitive for OR/AND operators', () => {
    expect(extractSearchTokens('links or rechts')).toEqual(['links', 'rechts'])
    expect(extractSearchTokens('links and rechts')).toEqual(['links', 'rechts'])
  })
})
