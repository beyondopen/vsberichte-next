import { readFile } from 'fs/promises'
import { gunzipSync } from 'zlib'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || '/data'
const WORDPOS_DIR = path.join(DATA_DIR, 'wordpos')

export interface HighlightBox {
  x: number
  y: number
  w: number
  h: number
}

interface WordPosition {
  t: string  // text
  x: number  // normalized x
  y: number  // normalized y
  w: number  // normalized width
  h: number  // normalized height
}

interface WordPosData {
  page_width: number
  page_height: number
  words: WordPosition[]
}

/**
 * Load word positions for a page image and return bounding boxes
 * for words that match any of the search tokens.
 *
 * Returns up to 50 highlight boxes.
 */
export async function getHighlightBoxes(
  fileUrl: string,
  searchTokens: string[]
): Promise<HighlightBox[]> {
  const basename = path.parse(fileUrl).name
  const wordposPath = path.join(WORDPOS_DIR, `${basename}.json.gz`)

  let buffer: Buffer
  try {
    buffer = await readFile(wordposPath)
  } catch {
    return []
  }

  const json = gunzipSync(buffer).toString('utf-8')
  const data: WordPosData = JSON.parse(json)

  const lowerTokens = searchTokens.map(t => t.toLowerCase())
  const boxes: HighlightBox[] = []

  for (const word of data.words) {
    const wordLower = word.t.toLowerCase()
    for (const token of lowerTokens) {
      if (wordLower.includes(token)) {
        boxes.push({
          x: word.x,
          y: word.y,
          w: word.w,
          h: word.h,
        })
        break
      }
    }
    if (boxes.length >= 50) break
  }

  return boxes
}
