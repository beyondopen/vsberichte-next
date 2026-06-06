import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Invalidate all corpus-derived caches (homepage counts, /berichte index,
 * trend/mention charts, sitemap). Called by the Payload job handler after a
 * document finishes processing; can also be triggered manually after bulk
 * imports:
 *
 *   curl -X POST -H "x-revalidate-secret: $PAYLOAD_SECRET" \
 *     https://vsb-next.app.jfilter.de/api/revalidate
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret')
  if (!process.env.PAYLOAD_SECRET || secret !== process.env.PAYLOAD_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  revalidateTag('corpus', 'max')
  return NextResponse.json({ revalidated: true })
}
