import { NextResponse } from 'next/server'
import { getDocument, getDocumentPages } from '@/lib/queries/documents'
import { slugToJurisdiction } from '@/lib/jurisdictions'

interface Params {
  jurisdiction: string
  year: string
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const { jurisdiction: slug, year: yearStr } = await params
  const jurisdiction = slugToJurisdiction(slug)
  const year = parseInt(yearStr, 10)

  if (isNaN(year)) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
  }

  const doc = await getDocument(jurisdiction, year)
  if (!doc) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const pages = await getDocumentPages(doc.id)

  return NextResponse.json({
    year: doc.year,
    title: doc.title,
    jurisdiction: doc.jurisdiction,
    file_url: `https://verfassungsschutzberichte.de${doc.file_url}`,
    num_pages: doc.num_pages,
    pages: pages.map(p => p.content),
  })
}
