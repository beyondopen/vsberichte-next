import { describe, it, expect } from 'vitest'
import { documentTypeLabels } from '@/lib/report-info'

describe('documentTypeLabels', () => {
  const expectedTypes = [
    'jahresbericht',
    'kurzfassung',
    'lagebild',
    'broschuere',
    'kompendium',
    'flyer',
    'english',
    'parlamentarisch',
  ]

  it('contains all expected document type keys', () => {
    for (const type of expectedTypes) {
      expect(documentTypeLabels).toHaveProperty(type)
    }
  })

  it('has no unexpected keys', () => {
    const keys = Object.keys(documentTypeLabels)
    expect(keys.sort()).toEqual([...expectedTypes].sort())
  })

  it('all types have a non-empty German label', () => {
    for (const [key, label] of Object.entries(documentTypeLabels)) {
      expect(typeof label, `${key} should be a string`).toBe('string')
      expect(label.length, `${key} label should be non-empty`).toBeGreaterThan(0)
    }
  })

  it('jahresbericht label is "Jahresbericht"', () => {
    expect(documentTypeLabels['jahresbericht']).toBe('Jahresbericht')
  })

  it('english label is "Englische Fassung"', () => {
    expect(documentTypeLabels['english']).toBe('Englische Fassung')
  })

  it('kurzfassung label is "Kurzfassung"', () => {
    expect(documentTypeLabels['kurzfassung']).toBe('Kurzfassung')
  })
})
