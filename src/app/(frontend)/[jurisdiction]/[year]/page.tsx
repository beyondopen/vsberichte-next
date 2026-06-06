import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDocument, getDocumentPages, getWordCount, getRelatedYears } from '@/lib/queries/documents'
import { slugToJurisdiction, jurisdictionToSlug } from '@/lib/jurisdictions'
import { PageImage } from '@/components/PageImage'

export const revalidate = 86400

interface Params {
  jurisdiction: string
  year: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { jurisdiction: slug, year: yearStr } = await params
  const jurisdiction = slugToJurisdiction(slug)
  const year = parseInt(yearStr, 10)
  return {
    title: `Verfassungsschutzbericht ${jurisdiction} ${year} -- Verfassungsschutzberichte.de`,
    description: `Verfassungsschutzbericht ${year} von ${jurisdiction}: durchsuchbar, mit Seitenbildern und als PDF herunterladbar.`,
    robots: { index: false, follow: false },
  }
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { jurisdiction: slug, year: yearStr } = await params
  const jurisdiction = slugToJurisdiction(slug)
  const year = parseInt(yearStr, 10)

  if (isNaN(year)) notFound()

  const doc = await getDocument(jurisdiction, year)
  if (!doc) notFound()

  const [pages, wordCount, relatedYears] = await Promise.all([
    getDocumentPages(doc.id),
    getWordCount(doc.id),
    getRelatedYears(jurisdiction, year),
  ])

  const jurSlug = jurisdictionToSlug(jurisdiction)

  return (
    <main id="main-content">
      {/* Document Header */}
      <section className="pt-8 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Breadcrumb */}
          <Link
            href="/berichte"
            className="inline-flex items-center text-sm text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors mb-8"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Berichte
          </Link>

          {/* Badge */}
          <div className="mb-4">
            <span className="inline-block bg-blue-700 text-white text-xs font-medium uppercase tracking-wider px-3 py-1 rounded">
              {jurisdiction}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-headline font-bold text-4xl lg:text-5xl tracking-tight mb-4">
            {doc.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <span>{doc.num_pages} Seiten</span>
            <span>&middot;</span>
            <span>{wordCount.toLocaleString('de-DE')} W&ouml;rter</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <a
              href={doc.file_url}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              PDF herunterladen
            </a>
            <a
              href={`/text-export/${slug}-${year}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              Als Text
            </a>
            <a
              href={`/api/${slug}/${year}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              JSON-API
            </a>
          </div>

          {/* Legal Note */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 max-w-3xl">
            <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong className="font-semibold">Hinweis:</strong> Der Verfassungsschutz ist keine
              neutrale Instanz. Die Informationen in den Berichten sollten nicht ungepr&uuml;ft als
              Wahrheit angenommen werden.
            </p>
          </div>
        </div>
      </section>

      {/* Page Images */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {pages.map((page) => (
            <div key={page.id} className="max-w-3xl mx-auto mb-8">
              <div className="text-sm text-gray-400 dark:text-gray-500 font-mono mb-2">
                Seite {page.page_number}
              </div>
              <PageImage
                src={page.file_url}
                alt={`Seite ${page.page_number} des ${doc.title} ${doc.jurisdiction}`}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          ))}

          {pages.length > 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-16">
              Alle {doc.num_pages} Seiten werden beim Scrollen geladen.
            </p>
          )}
        </div>
      </section>

      {/* Related Reports */}
      {relatedYears.length > 0 && (
        <section className="pb-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
              Weitere Berichte: {jurisdiction}
            </h2>
            <div className="flex flex-wrap gap-2">
              {relatedYears.map((y) => (
                <Link
                  key={y}
                  href={`/${jurSlug}/${y}`}
                  className="inline-block px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-colors"
                >
                  {y}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
