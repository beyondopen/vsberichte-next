import { NextRequest, NextResponse } from 'next/server'
import { getAutocompleteSuggestions } from '@/lib/queries/autocomplete'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  if (q.length === 0) {
    return NextResponse.json([])
  }

  // Optional limit (default 10, clamped) so dropdowns can stay short
  const limitParam = parseInt(request.nextUrl.searchParams.get('limit') ?? '', 10)
  const limit = isNaN(limitParam) ? 10 : Math.min(Math.max(limitParam, 1), 10)

  const suggestions = await getAutocompleteSuggestions(q, limit)
  return NextResponse.json(suggestions, {
    headers: {
      // Prefix suggestions are stable — absorb keystroke bursts at the edge
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  })
}
