import type { Metadata } from 'next'
import Link from 'next/link'
import { getIndex, getFilteredDocuments } from '@/lib/queries/documents'
import { reportInfo, documentTypeLabels } from '@/lib/report-info'
import { jurisdictions, jurisdictionToSlug } from '@/lib/jurisdictions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Berichte -- Verfassungsschutzberichte.de',
  description:
    'Alle Verfassungsschutzberichte von Bund und Laendern: gesammelt, durchsuchbar und als PDF herunterladbar.',
}

const typeBadgeColors: Record<string, string> = {
  jahresbericht:
    'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  kurzfassung:
    'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  lagebild:
    'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  broschuere:
    'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  kompendium:
    'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  flyer:
    'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  parlamentarisch:
    'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
}

interface BerichtePageProps {
  searchParams: Promise<{
    type?: string
    language?: string
    jurisdiction?: string
    min_year?: string
    max_year?: string
  }>
}

export default async function BerichtePage({ searchParams }: BerichtePageProps) {
  const params = await searchParams
  const type = params.type || 'jahresbericht'
  const languageFilter = params.language || ''
  const jurisdictionFilter = params.jurisdiction || ''
  const minYearStr = params.min_year || ''
  const maxYearStr = params.max_year || ''
  const minYear = minYearStr ? parseInt(minYearStr, 10) : undefined
  const maxYear = maxYearStr ? parseInt(maxYearStr, 10) : undefined

  const showGrid = type === 'jahresbericht'

  // For the grid view, use getIndex filtered by type
  // For list view, use getFilteredDocuments
  const { index, total } = showGrid
    ? await getIndex(type)
    : { index: [], total: 0 }

  const filteredDocuments = !showGrid
    ? await getFilteredDocuments({
        documentType: type,
        language: languageFilter || undefined,
        jurisdiction: jurisdictionFilter || undefined,
        minYear,
        maxYear,
      })
    : []

  const displayTotal = showGrid ? total : filteredDocuments.length

  const currentYear = new Date().getFullYear()

  // Build a lookup map: jurisdiction -> Set of available years (for grid)
  const availableYears = new Map<string, Set<number>>()
  for (const entry of index) {
    availableYears.set(entry.jurisdiction, new Set(entry.years))
  }

  // Year range for dropdowns
  const startYear = 1950
  const endYear = currentYear

  return (
    <main id="main-content">
      {/* Page Header */}
      <section className="pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-headline font-bold text-4xl lg:text-5xl tracking-tight mb-3">
            Berichte
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            {displayTotal} Verfassungsschutzberichte von Bund und L&auml;ndern
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
            Wir sammeln die PDFs der Berichte und stellen sie dem Web entsprechend dar. Jeder
            verf&uuml;gbare Bericht ist durchsuchbar, mit Seitenbildern versehen und als PDF
            herunterladbar.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <form action="/berichte" method="get">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Dokumenttyp
                  </label>
                  <select
                    id="filter-type"
                    name="type"
                    defaultValue={type}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="jahresbericht">Jahresbericht</option>
                    <option value="kurzfassung">Kurzfassung</option>
                    <option value="lagebild">Lagebild</option>
                    <option value="broschuere">Brosch&uuml;re</option>
                    <option value="kompendium">Kompendium</option>
                    <option value="flyer">Flyer</option>
                    <option value="parlamentarisch">Parlamentarische Fassung</option>
                    <option value="alle">Alle Typen</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Sprache
                  </label>
                  <select
                    id="filter-language"
                    name="language"
                    defaultValue={languageFilter}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Alle Sprachen</option>
                    <option value="de">Deutsch</option>
                    <option value="en">Englisch</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-jurisdiction" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Beh&ouml;rde
                  </label>
                  <select
                    id="filter-jurisdiction"
                    name="jurisdiction"
                    defaultValue={jurisdictionFilter}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Alle Beh&ouml;rden</option>
                    {jurisdictions.map((jur) => (
                      <option key={jur} value={jur}>
                        {jur}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-min-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Von
                  </label>
                  <select
                    id="filter-min-year"
                    name="min_year"
                    defaultValue={minYearStr}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Von</option>
                    {Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i).map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="filter-max-year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Bis
                  </label>
                  <select
                    id="filter-max-year"
                    name="max_year"
                    defaultValue={maxYearStr}
                    className="px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Bis</option>
                    {Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i).map(
                      (y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm"
                  >
                    Filtern
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Content Area */}
      {showGrid ? (
        <>
          {/* Legend */}
          <section className="pb-8">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded bg-blue-600" />
                  Verf&uuml;gbar
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
            </div>
          </section>

          {/* Reports Grid */}
          <section className="pb-24">
            <div className="max-w-6xl mx-auto px-6 space-y-12">
              {jurisdictions.map((jur) => {
                const jurStartYear = reportInfo.startYear[jur]
                const noReportYears = new Set(reportInfo.noReports[jur] || [])
                const available = availableYears.get(jur) || new Set<number>()
                const slug = jurisdictionToSlug(jur)

                if (!jurStartYear) return null

                return (
                  <div key={jur}>
                    <h2 className="font-headline font-bold text-2xl tracking-tight mb-3">
                      {jur}{' '}
                      <span className="text-gray-400 dark:text-gray-500 font-normal text-lg">
                        (seit {jurStartYear})
                      </span>
                    </h2>
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(
                        { length: currentYear - jurStartYear + 1 },
                        (_, i) => currentYear - i
                      ).map((year) => {
                        if (noReportYears.has(year)) {
                          // Not published -- gray
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

                        if (available.has(year)) {
                          // Available -- blue link
                          return (
                            <Link
                              key={year}
                              href={`/${slug}/${year}`}
                              className="border-2 border-transparent bg-blue-600 text-white hover:bg-blue-700 rounded px-2.5 py-1.5 text-sm font-mono font-medium transition-colors"
                              title={`${year} -- Verf\u00fcgbar`}
                            >
                              {year}
                            </Link>
                          )
                        }

                        // Missing -- amber outline
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
                )
              })}
            </div>
          </section>
        </>
      ) : (
        /* Card/List View for non-jahresbericht types */
        <section className="pb-24">
          <div className="max-w-6xl mx-auto px-6">
            {filteredDocuments.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-lg py-12 text-center">
                Keine Berichte f&uuml;r die gew&auml;hlten Filter gefunden.
              </p>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => {
                  const slug = jurisdictionToSlug(doc.jurisdiction)
                  const badgeColor =
                    typeBadgeColors[doc.document_type] ||
                    'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  const typeLabel =
                    documentTypeLabels[doc.document_type] || doc.document_type

                  return (
                    <article
                      key={doc.id}
                      className="border border-gray-200 dark:border-gray-800 rounded-xl p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${badgeColor}`}
                            >
                              {typeLabel}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.jurisdiction}
                            </span>
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              &middot; {doc.year}
                            </span>
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              &middot; {doc.num_pages} Seiten
                            </span>
                          </div>
                          <h2 className="text-lg font-bold">
                            <Link
                              href={`/${slug}/${doc.year}`}
                              className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                            >
                              {doc.title}
                            </Link>
                          </h2>
                        </div>
                        <div className="flex-shrink-0">
                          <Link
                            href={`/${slug}/${doc.year}`}
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
            )}
          </div>
        </section>
      )}

      {/* Open Data Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-headline font-bold text-3xl tracking-tight mb-6">Offene Daten</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mb-8">
            Alle gesammelten Berichte und extrahierten Texte stehen als offene Daten zur
            Verf&uuml;gung. Nutzen Sie die Daten f&uuml;r Ihre eigene Forschung oder Projekte.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="/downloads/vsberichte.zip"
              className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-medium text-sm"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Alle PDFs herunterladen (ZIP)
            </a>
            <a
              href="/downloads/vsberichte-texts.zip"
              className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-medium text-sm"
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
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Alle Texte herunterladen (ZIP)
            </a>
            <a
              href="/api"
              className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors font-medium text-sm"
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              JSON-API verf&uuml;gbar
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
