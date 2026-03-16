import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || '/data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const safeName = path.basename(filename)
  const filePath = path.join(DATA_DIR, 'images', safeName)
  const ext = path.extname(safeName).toLowerCase()
  const contentType = ext === '.png' ? 'image/png' : ext === '.avif' ? 'image/avif' : 'image/jpeg'

  if (process.env.NODE_ENV === 'production') {
    return new NextResponse(null, {
      headers: {
        'X-Accel-Redirect': `/internal-images/${safeName}`,
        'Content-Type': contentType,
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  try {
    const fileStat = await stat(filePath)
    const file = await readFile(filePath)
    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileStat.size),
        'Cache-Control': 'public, max-age=604800',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
