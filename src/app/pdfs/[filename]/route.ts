import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const DATA_DIR = process.env.DATA_DIR || '/data'
const PDF_DIR = path.join(DATA_DIR, 'pdfs')
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

interface Params {
  filename: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const { filename } = await params

  // Path traversal prevention: only use the basename
  const safeName = path.basename(filename)
  if (safeName !== filename || !safeName.endsWith('.pdf')) {
    return new NextResponse('Not found', { status: 404 })
  }

  if (IS_PRODUCTION) {
    // In production behind nginx, use X-Accel-Redirect
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Accel-Redirect': `/internal-pdfs/${safeName}`,
        'Content-Type': 'application/pdf',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  }

  // In development, serve the file directly
  const filePath = path.join(PDF_DIR, safeName)
  try {
    const data = await readFile(filePath)
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
