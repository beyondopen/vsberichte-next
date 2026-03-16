import { describe, it, expect } from 'vitest'
import { getHighlightBoxes } from '@/lib/wordpos'

describe('getHighlightBoxes', () => {
  it('returns an empty array for a non-existent file', async () => {
    const result = await getHighlightBoxes('/nonexistent/path/file.png', ['test'])
    expect(result).toEqual([])
  })

  it('returns an empty array when search tokens are empty', async () => {
    const result = await getHighlightBoxes('/nonexistent/path/file.png', [])
    expect(result).toEqual([])
  })

  it('function signature returns a Promise', () => {
    const result = getHighlightBoxes('any-file.png', ['token'])
    expect(result).toBeInstanceOf(Promise)
  })
})
