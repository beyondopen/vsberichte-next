import type { Metadata } from 'next'
import Link from 'next/link'
import { searchDocumentPages, extractSearchTokens } from '@/lib/queries/search'
import { getHighlightBoxes } from '@/lib/wordpos'
import { jurisdictions, jurisdictionToSlug } from '@/lib/jurisdictions'
import Pagination from '@/components/Pagination'
import SearchResultImage from '@/components/SearchResultImage'
import FilterPanel from '@/components/filters/FilterPanel'
import { FilterSubmit } from '@/components/filters/FilterBar'
import SearchInput from '@/components/filters/SearchInput'
import SelectFilter from '@/components/filters/SelectFilter'
import YearRangeFilter from '@/components/filters/YearRangeFilter'
import { getYearBounds } from '@/lib/queries/documents'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Suche -- Verfassungsschutzberichte.de',
  description: 'Durchsuche alle Verfassungsschutzberichte von Bund und Laendern im Volltext.',
  robots: { index: false, follow: false },
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    jurisdiction?: string
    min_year?: string
    max_year?: string
    seite?: string
  }>
}

export default async function SuchePage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const q = params.q ?? ''
  const jurisdiction = params.jurisdiction || ''
  const minYearStr = params.min_year || ''
  const maxYearStr = params.max_year || ''
  const page = parseInt(params.seite || '1', 10) || 1
  const perPage = 20

  const minYear = minYearStr ? parseInt(minYearStr, 10) : null
  const maxYear = maxYearStr ? parseInt(maxYearStr, 10) : null

  const hasQuery = q.length > 0

  let results: Awaited<ReturnType<typeof searchDocumentPages>> | null = null
  let tokens: string[] = []

  if (hasQuery) {
    results = await searchDocumentPages(q, {
      jurisdiction: jurisdiction || null,
      minYear: isNaN(minYear as number) ? null : minYear,
      maxYear: isNaN(maxYear as number) ? null : maxYear,
      page,
      perPage,
    })

    tokens = extractSearchTokens(q)

    // Enrich results with highlight boxes
    for (const r of results.results) {
      r.highlight_boxes = await getHighlightBoxes(r.file_url, tokens)
    }
  }

  const totalPages = results ? Math.ceil(results.total / perPage) : 0

  // Build base URL for pagination
  const paginationParams = new URLSearchParams()
  if (q) paginationParams.set('q', q)
  if (jurisdiction) paginationParams.set('jurisdiction', jurisdiction)
  if (minYearStr) paginationParams.set('min_year', minYearStr)
  if (maxYearStr) paginationParams.set('max_year', maxYearStr)
  const baseUrl = `/suche?${paginationParams.toString()}`

  const yearBounds = await getYearBounds()

  return (
    <>
      {/* Page Header */}
      <section className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-headline font-bold text-4xl tracking-tight mb-2">Suche</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Durchsuche alle Verfassungsschutzberichte
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-6">
          <FilterPanel action="/suche">
            {/* Search input row */}
            <div className="flex gap-3">
              <SearchInput
                id="search-input"
                label="Suchbegriff"
                defaultValue={q}
                placeholder="Suchbegriff eingeben..."
              />
              <FilterSubmit className="px-8 py-3.5 text-base">Suchen</FilterSubmit>
            </div>
            {/* Filters row */}
            <div className="flex flex-wrap items-end gap-3">
              <SelectFilter
                id="filter-jurisdiction"
                name="jurisdiction"
                label="Behörde"
                allLabel="Alle Behörden"
                options={jurisdictions}
                defaultValue={jurisdiction}
              />
              <YearRangeFilter
                minLimit={yearBounds.minYear}
                maxLimit={yearBounds.maxYear}
                defaultMin={minYearStr}
                defaultMax={maxYearStr}
              />
            </div>
          </FilterPanel>
        </div>
      </section>

      {/* Results */}
      {hasQuery && results && (
        <>
          {/* Results Header */}
          <section className="pb-6">
            <div className="max-w-6xl mx-auto px-6">
              <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                <p className="text-lg font-medium">
                  {results.total} {results.total === 1 ? 'Ergebnis' : 'Ergebnisse'} fuer &bdquo;{q}
                  &ldquo;
                </p>
                {totalPages > 1 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Seite {page} von {totalPages}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Search Results */}
          <section className="pb-16">
            <div className="max-w-6xl mx-auto px-6 space-y-6">
              {results.results.map((result) => {
                const jurSlug = jurisdictionToSlug(result.jurisdiction)
                return (
                  <article
                    key={result.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-xl p-6"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Thumbnail with highlight boxes — click to expand */}
                      <SearchResultImage
                        src={result.file_url}
                        alt={`Seite ${result.page_number} — ${result.jurisdiction} ${result.year}`}
                        highlightBoxes={result.highlight_boxes}
                      />
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-block px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                            {result.jurisdiction}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {result.year}
                          </span>
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            &middot; Seite {result.page_number}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold mb-3">
                          <Link
                            href={`/${jurSlug}/${result.year}`}
                            className="text-gray-900 dark:text-gray-100 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                          >
                            Verfassungsschutzbericht {result.jurisdiction} {result.year}
                          </Link>
                        </h2>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {result.snippets.map((snippet, i) => (
                            <p
                              key={i}
                              dangerouslySetInnerHTML={{
                                __html:
                                  '&hellip;' +
                                  snippet
                                    .replace(
                                      /<b>/g,
                                      '<mark class="bg-yellow-100 dark:bg-yellow-900/50 px-0.5 rounded">'
                                    )
                                    .replace(/<\/b>/g, '</mark>') +
                                  '&hellip;',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <section className="pb-20">
              <div className="max-w-6xl mx-auto px-6 flex justify-center">
                <Pagination currentPage={page} totalPages={totalPages} baseUrl={baseUrl} />
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
