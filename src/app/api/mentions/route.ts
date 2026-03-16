import { NextRequest, NextResponse } from 'next/server'
import { getMentions } from '@/lib/queries/mentions'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const q = searchParams.get('q')
  const toCsv = searchParams.has('csv')

  if (!q || q.length === 0) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 404 })
  }

  const jurisdiction = searchParams.get('jurisdiction') || null
  const minYearStr = searchParams.get('min_year')
  const maxYearStr = searchParams.get('max_year')
  const minYear = minYearStr ? parseInt(minYearStr, 10) : null
  const maxYear = maxYearStr ? parseInt(maxYearStr, 10) : null

  const results = await getMentions(q, {
    jurisdiction,
    minYear: isNaN(minYear as number) ? null : minYear,
    maxYear: isNaN(maxYear as number) ? null : maxYear,
  })

  if (toCsv) {
    const csvLines = ['juris;year;count']
    for (const [jur, yearData] of Object.entries(results)) {
      for (const [year, count] of Object.entries(yearData)) {
        csvLines.push(`${jur};${year};${count}`)
      }
    }
    return new Response(csvLines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  return NextResponse.json(results)
}
