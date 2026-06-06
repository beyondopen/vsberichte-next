import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFilteredDocuments } from '@/lib/queries/documents'
import { jurisdictions, slugToJurisdiction, jurisdictionToSlug } from '@/lib/jurisdictions'
import { reportInfo, documentTypeLabels } from '@/lib/report-info'

export const revalidate = 86400

interface Params {
  jurisdiction: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { jurisdiction: slug } = await params
  const jurisdiction = slugToJurisdiction(slug)
  if (!jurisdictions.includes(jurisdiction)) return {}
  const startYear = reportInfo.startYear[jurisdiction]
  return {
    title: `Verfassungsschutzberichte ${jurisdiction} -- alle Jahrgänge -- Verfassungsschutzberichte.de`,
    description: `Alle Verfassungsschutzberichte von ${jurisdiction}${startYear ? ` seit ${startYear}` : ''}: Jahresübersicht, Volltextsuche und PDFs zum Herunterladen.`,
  }
}

export default async function JurisdictionPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { jurisdiction: slug } = await params
  const jurisdiction = slugToJurisdiction(slug)

  // This dynamic segment catches every unknown top-level path —
  // anything that is not a known Behörde must 404.
  if (!jurisdictions.includes(jurisdiction)) notFound()

  const jurStartYear = reportInfo.startYear[jurisdiction]
  if (!jurStartYear) notFound()

  const documents = await getFilteredDocuments({ jurisdictions: [jurisdiction] })

  const currentYear = new Date().getFullYear()
  const noReportYears = new Set(reportInfo.noReports[jurisdiction] || [])
  const availableYears = new Set(
    documents.filter((d) => d.document_type === 'jahresbericht').map((d) => d.year)
  )
  const otherDocuments = documents
    .filter((d) => d.document_type !== 'jahresbericht')
    .sort((a, b) => b.year - a.year)

  return (
    <>
      {/* Page Header */}
      <section className="pt-8 pb-10">
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

          <h1 className="font-headline font-bold text-4xl lg:text-5xl tracking-tight mb-3">
            Verfassungsschutzberichte {jurisdiction}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {documents.length} {documents.length === 1 ? 'Bericht' : 'Berichte'} seit{' '}
            {jurStartYear}
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            Alle verfügbaren Berichte des Verfassungsschutzes{' '}
            {jurisdiction === 'Bund' ? 'des Bundes' : `aus ${jurisdiction}`}: durchsuchbar, mit
            Seitenbildern und als PDF herunterladbar.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={`/suche?jurisdiction=${encodeURIComponent(jurisdiction)}`}
              className="inline-flex items-center px-5 py-2.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm"
            >
              Im Volltext durchsuchen
            </Link>
            <Link
              href="/analyse"
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors text-sm"
            >
              Begriffe analysieren
            </Link>
          </div>
        </div>
      </section>

      {/* Year Grid */}
      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-headline font-bold text-2xl tracking-tight mb-4">Jahresberichte</h2>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-blue-600" />
              Verfügbar
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded border-2 border-amber-400" />
              Fehlt uns noch
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 rounded bg-gray-200 dark:bg-gray-800" />
              Nicht erschienen
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(
              { length: currentYear - jurStartYear + 1 },
              (_, i) => currentYear - i
            ).map((year) => {
              if (noReportYears.has(year)) {
                return (
                  <span
                    key={year}
                    className="border-2 border-transparent bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded px-2.5 py-1.5 text-sm font-mono"
                    title={`${year} -- Nicht erschienen`}
                  >
                    {year}
                  </span>
                )
              }

              if (availableYears.has(year)) {
                return (
                  <Link
                    key={year}
                    href={`/${jurisdictionToSlug(jurisdiction)}/${year}`}
                    className="border-2 border-transparent bg-blue-600 text-white hover:bg-blue-700 rounded px-2.5 py-1.5 text-sm font-mono font-medium transition-colors"
                    title={`${year} -- Verfügbar`}
                  >
                    {year}
                  </Link>
                )
              }

              return (
                <span
                  key={year}
                  className="border-2 border-amber-400 text-amber-600 dark:text-amber-400 rounded px-2.5 py-1.5 text-sm font-mono"
                  title={`${year} -- Fehlt uns noch`}
                >
                  {year}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* Other document types */}
      {otherDocuments.length > 0 && (
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="font-headline font-bold text-2xl tracking-tight mb-4">
              Weitere Dokumente
            </h2>
            <div className="space-y-4">
              {otherDocuments.map((doc) => {
                const typeLabel = documentTypeLabels[doc.document_type] || doc.document_type
                return (
                  <article
                    key={doc.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-xl p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-block px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
                            {typeLabel}
                          </span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            {doc.year} &middot; {doc.num_pages} Seiten
                          </span>
                        </div>
                        <h3 className="text-lg font-bold">
                          <Link
                            href={`/${jurisdictionToSlug(jurisdiction)}/${doc.year}`}
                            className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                          >
                            {doc.title}
                          </Link>
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <Link
                          href={`/${jurisdictionToSlug(jurisdiction)}/${doc.year}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          Ansehen
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
