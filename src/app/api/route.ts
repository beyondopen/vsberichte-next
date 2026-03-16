import { NextResponse } from 'next/server'
import { getIndex } from '@/lib/queries/documents'

export async function GET() {
  const { index, total } = await getIndex()
  const reports = index.map(item => ({
    jurisdiction: item.jurisdiction,
    years: item.years,
    jurisdiction_escaped: encodeURIComponent(item.jurisdiction.toLowerCase()),
  }))
  return NextResponse.json({ reports, total })
}
