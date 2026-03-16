import { NextRequest, NextResponse } from 'next/server'
import { getDocument, getDocumentPages } from '@/lib/queries/documents'
import { slugToJurisdiction } from '@/lib/jurisdictions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Parse jurisdiction and year from slug like "bund-2023"
  const match = slug.match(/^(.+)-(\d{4})$/)
  if (!match) {
    return new NextResponse(null, { status: 404 })
  }

  const jurisdiction = slugToJurisdiction(match[1])
  const year = parseInt(match[2])

  try {
    const doc = await getDocument(jurisdiction, year)
    if (!doc) {
      return new NextResponse(null, { status: 404 })
    }

    const pages = await getDocumentPages(doc.id)
    const text = pages.map(p => p.content).join('\n\n\n')

    return new NextResponse(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
