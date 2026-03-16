import { NextRequest, NextResponse } from 'next/server'
import { getAutocompleteSuggestions } from '@/lib/queries/autocomplete'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''

  if (q.length === 0) {
    return NextResponse.json([])
  }

  const suggestions = await getAutocompleteSuggestions(q)
  return NextResponse.json(suggestions)
}
