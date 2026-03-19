import { describe, it, expect } from 'vitest'
import {
  abbreviations,
  startYear,
  noReports,
  documentTypeLabels,
  reportInfo,
} from '@/lib/report-info'
import { jurisdictions } from '@/lib/jurisdictions'

describe('abbreviations', () => {
  it('has 16 entries (one per Bundesland)', () => {
    expect(abbreviations).toHaveLength(16)
  })

  it('each abbreviation maps to a valid Bundesland name', () => {
    const allJurisdictions = jurisdictions.filter(j => j !== 'Bund')
    for (const [abbr, name] of abbreviations) {
      expect(abbr).toMatch(/^[A-Z]{2}$/)
      expect(allJurisdictions).toContain(name)
    }
  })
})

describe('startYear', () => {
  it('has entries for all jurisdictions including Bund', () => {
    for (const j of jurisdictions) {
      expect(startYear).toHaveProperty(j)
    }
  })

  it('start years are in the 1950-2013 range', () => {
    for (const [jurisdiction, year] of Object.entries(startYear)) {
      expect(year, `${jurisdiction} startYear`).toBeGreaterThanOrEqual(1950)
      expect(year, `${jurisdiction} startYear`).toBeLessThanOrEqual(2013)
    }
  })
})

describe('noReports', () => {
  it('keys match all jurisdictions', () => {
    const noReportKeys = Object.keys(noReports).sort()
    const expected = jurisdictions.slice().sort()
    expect(noReportKeys).toEqual(expected)
  })

  it('each value is an array of numbers', () => {
    for (const [jurisdiction, years] of Object.entries(noReports)) {
      expect(Array.isArray(years), `${jurisdiction} noReports should be array`).toBe(true)
      for (const y of years) {
        expect(typeof y, `${jurisdiction} noReports entry`).toBe('number')
      }
    }
  })
})

describe('documentTypeLabels', () => {
  it('has all expected document types', () => {
    const expectedTypes = [
      'jahresbericht',
      'kurzfassung',
      'lagebild',
      'broschuere',
      'kompendium',
      'flyer',
      'parlamentarisch',
    ]
    for (const type of expectedTypes) {
      expect(documentTypeLabels).toHaveProperty(type)
    }
  })

  it('values are non-empty German strings', () => {
    for (const [key, label] of Object.entries(documentTypeLabels)) {
      expect(typeof label, `${key} label type`).toBe('string')
      expect(label.length, `${key} label length`).toBeGreaterThan(0)
    }
  })
})

describe('reportInfo export', () => {
  it('bundles abbreviations, startYear, and noReports', () => {
    expect(reportInfo.abbreviations).toBe(abbreviations)
    expect(reportInfo.startYear).toBe(startYear)
    expect(reportInfo.noReports).toBe(noReports)
  })
})
