import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || '/data'
const ALLOWED_FILES = new Set(['vsberichte.zip', 'vsberichte-texts.zip'])

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  if (!ALLOWED_FILES.has(filename)) {
    return new NextResponse(null, { status: 404 })
  }

  const filePath = path.join(DATA_DIR, 'zips', filename)

  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, {
      headers: {
        'X-Accel-Redirect': `/internal-zips/${filename}`,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=${filename}`,
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  try {
    const fileStat = await stat(filePath)
    const file = await readFile(filePath)
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Length': String(fileStat.size),
        'Content-Disposition': `attachment; filename=${filename}`,
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
