import { NextRequest, NextResponse } from 'next/server'
import { getTermStats } from '@/lib/queries/stats'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')

  if (!q) {
    return NextResponse.json({})
  }

  const jurisdiction = searchParams.get('jurisdiction') || null
  const minYearStr = searchParams.get('min_year')
  const maxYearStr = searchParams.get('max_year')
  const minYear = minYearStr ? parseInt(minYearStr, 10) : null
  const maxYear = maxYearStr ? parseInt(maxYearStr, 10) : null

  const result = await getTermStats(q, {
    jurisdiction,
    minYear: isNaN(minYear as number) ? null : minYear,
    maxYear: isNaN(maxYear as number) ? null : maxYear,
  })

  return NextResponse.json(result)
}
