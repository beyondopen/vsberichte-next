import type { Metadata } from 'next'
import Link from 'next/link'
import { getTermStats } from '@/lib/queries/stats'
import { getMentions } from '@/lib/queries/mentions'
import { getYearBounds } from '@/lib/queries/documents'
import { jurisdictions, normalizeJurisdictions } from '@/lib/jurisdictions'
import TrendChart from '@/components/TrendChart'
import Heatmap from '@/components/Heatmap'
import FilterPanel from '@/components/filters/FilterPanel'
import { FilterSubmit } from '@/components/filters/FilterBar'
import TermTags from '@/components/filters/TermTags'
import TermAutocompleteInput from '@/components/filters/TermAutocompleteInput'
import MultiSelectFilter from '@/components/filters/MultiSelectFilter'
import YearRangeFilter from '@/components/filters/YearRangeFilter'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Analyse -- Verfassungsschutzberichte.de',
  description:
    'Analysiere Begriffe in den Verfassungsschutzberichten: im zeitlichen Verlauf und im Vergleich über alle Bundesländer.',
  openGraph: {
    images: [{ url: '/thumbnail_regional.jpg' }],
  },
}

const MAX_TERMS = 5

interface AnalysePageProps {
  searchParams: Promise<{
    q?: string | string[]
    term?: string
    remove?: string
    jurisdiction?: string | string[]
    min_year?: string
    max_year?: string
    fokus?: string
  }>
}

/** Build an /analyse URL carrying terms, jurisdictions, year range and heatmap fokus. */
function analyseUrl(options: {
  terms: string[]
  jurisdictions?: string[]
  minYear?: string
  maxYear?: string
  fokus?: string
}): string {
  const params = new URLSearchParams()
  for (const term of options.terms) {
    params.append('q', term)
  }
  for (const j of options.jurisdictions ?? []) {
    params.append('jurisdiction', j)
  }
  if (options.minYear) params.set('min_year', options.minYear)
  if (options.maxYear) params.set('max_year', options.maxYear)
  if (options.fokus) params.set('fokus', options.fokus)
  const qs = params.toString()
  return qs ? `/analyse?${qs}` : '/analyse'
}

export default async function AnalysePage({ searchParams }: AnalysePageProps) {
  const params = await searchParams

  // Collect active terms from q params
  let terms: string[] = []
  if (params.q) {
    terms = Array.isArray(params.q) ? params.q : [params.q]
  }

  // Handle adding a new term
  if (params.term && params.term.trim().length > 0) {
    const newTerm = params.term.trim()
    if (!terms.includes(newTerm)) {
      terms = [...terms, newTerm]
    }
  }

  // Handle removing a term (kept for inbound /trends links)
  if (params.remove) {
    terms = terms.filter((t) => t !== params.remove)
  }

  // Cap once, before fokus resolution and fetching
  terms = terms.slice(0, MAX_TERMS)

  // Heatmap shows one term: the fokus param if it is an active term,
  // otherwise the first term.
  const fokus =
    params.fokus && terms.includes(params.fokus) ? params.fokus : terms[0]

  const selectedJurisdictions = normalizeJurisdictions(params.jurisdiction)

  const minYearStr = params.min_year || ''
  const maxYearStr = params.max_year || ''
  const minYearParsed = minYearStr ? parseInt(minYearStr, 10) : null
  const maxYearParsed = maxYearStr ? parseInt(maxYearStr, 10) : null
  const minYear = isNaN(minYearParsed as number) ? null : minYearParsed
  const maxYear = isNaN(maxYearParsed as number) ? null : maxYearParsed

  // Fetch everything concurrently: per-term stats for the chart, mentions
  // for the fokus term's heatmap, and the slider bounds.
  const yearBoundsPromise = getYearBounds()
  let statsData: [string, Record<number, number>][] = []
  let mentionsData: Record<string, Record<number, number>> | null = null

  if (terms.length > 0) {
    const [stats, mentions] = await Promise.all([
      Promise.all(
        terms.map((term) =>
          getTermStats(term, {
            jurisdictions: selectedJurisdictions,
            minYear,
            maxYear,
          })
        )
      ),
      // The heatmap stays unfiltered by jurisdiction — it IS the comparison
      fokus ? getMentions(fokus, { minYear, maxYear }) : Promise.resolve(null),
    ])
    statsData = stats
    mentionsData = mentions
  }
  const yearBounds = await yearBoundsPromise

  // Years for the chart data table
  const allYears = new Set<number>()
  for (const [, yearData] of statsData) {
    for (const year of Object.keys(yearData)) {
      allYears.add(parseInt(year, 10))
    }
  }
  const sortedYears = Array.from(allYears).sort((a, b) => a - b)

  // Years for the heatmap columns
  let heatmapYears: number[] = []
  if (mentionsData) {
    const yearSet = new Set<number>()
    for (const jurData of Object.values(mentionsData)) {
      for (const y of Object.keys(jurData)) {
        yearSet.add(parseInt(y, 10))
      }
    }
    heatmapYears = Array.from(yearSet).sort((a, b) => a - b)
  }

  // CSV export for the fokus term
  const csvParams = new URLSearchParams()
  if (fokus) csvParams.set('q', fokus)
  if (minYearStr) csvParams.set('min_year', minYearStr)
  if (maxYearStr) csvParams.set('max_year', maxYearStr)
  csvParams.set('csv', '1')
  const csvUrl = `/api/mentions?${csvParams.toString()}`

  // Suggestions
  const suggestions = ['linksextrem', 'rechtsextrem', 'cyber', 'internet', 'NPD', 'PKK']

  return (
    <>
      {/* Page Header */}
      <section className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-headline font-bold text-4xl tracking-tight mb-2">Analyse</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Begriffe im zeitlichen Verlauf und im regionalen Vergleich
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            Wie oft werden Begriffe in den Verfassungsschutzberichten erwähnt? Vergleiche bis zu
            fünf Begriffe über die Jahre und sieh dir für einen Begriff die Verteilung über die
            Bundesländer an.
          </p>
        </div>
      </section>

      {/* Filter Panel */}
      <section className="pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <FilterPanel action="/analyse" className="mb-4">
            {/* Carry existing terms as hidden fields */}
            {terms.map((t) => (
              <input key={t} type="hidden" name="q" value={t} />
            ))}
            {/* Keep a non-default heatmap fokus across form submits
                (e.g. year-range changes) */}
            {fokus && fokus !== terms[0] && (
              <input type="hidden" name="fokus" value={fokus} />
            )}
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-56 max-w-md">
                <label
                  htmlFor="term-input"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                >
                  Begriff
                </label>
                <TermAutocompleteInput
                  id="term-input"
                  placeholder="Begriff eingeben..."
                />
              </div>
              <FilterSubmit hideWhenEnhanced={false}>Hinzufügen</FilterSubmit>
              <MultiSelectFilter
                id="filter-jurisdiction"
                name="jurisdiction"
                label="Behörde"
                allLabel="Alle Behörden"
                countNoun="Behörden"
                options={jurisdictions}
                selected={selectedJurisdictions}
              />
              <YearRangeFilter
                minLimit={yearBounds.minYear}
                maxLimit={yearBounds.maxYear}
                defaultMin={minYearStr}
                defaultMax={maxYearStr}
              />
            </div>
          </FilterPanel>

          <TermTags
            terms={terms}
            suggestions={suggestions}
            extraParams={{ min_year: minYearStr, max_year: maxYearStr }}
            multiParams={{ jurisdiction: selectedJurisdictions }}
          />
        </div>
      </section>

      {/* Zeitverlauf */}
      {terms.length > 0 && (
        <section className="pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-lg mb-1">
                Relative Häufigkeit: {terms.join(', ')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {selectedJurisdictions.length > 0
                  ? selectedJurisdictions.join(', ')
                  : 'Alle Berichte'}
                {sortedYears.length > 0 &&
                  `, ${sortedYears[0]}–${sortedYears[sortedYears.length - 1]}`}
              </p>

              {/* Interactive Chart */}
              <TrendChart statsData={statsData} terms={terms} />
            </div>
          </div>
        </section>
      )}

      {/* Data Table (collapsible fallback) */}
      {terms.length > 0 && sortedYears.length > 0 && (
        <section className="pb-10">
          <div className="max-w-6xl mx-auto px-6">
            <details className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors select-none">
                Daten als Tabelle anzeigen
              </summary>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-t border-gray-200 dark:border-gray-800">
                      <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50">
                        Jahr
                      </th>
                      {statsData.map(([term]) => (
                        <th
                          key={term}
                          className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50"
                        >
                          {term}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedYears.map((year, idx) => (
                      <tr
                        key={year}
                        className={`border-t border-gray-100 dark:border-gray-800/50 ${
                          idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''
                        }`}
                      >
                        <td className="px-6 py-2.5 text-gray-900 dark:text-gray-100">{year}</td>
                        {statsData.map(([term, yearData]) => (
                          <td
                            key={term}
                            className="px-6 py-2.5 text-right tabular-nums text-gray-600 dark:text-gray-400"
                          >
                            {(yearData[year] ?? 0).toFixed(6)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        </section>
      )}

      {/* Regional Heatmap */}
      {fokus && mentionsData && heatmapYears.length > 0 && (
        <>
          <section className="pb-6">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="font-bold text-lg mb-4">
                Erwähnungen von &bdquo;{fokus}&ldquo; nach Region und Jahr
              </h2>

              {/* Fokus switcher (only with multiple terms) — plain links, no-JS safe */}
              {terms.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Begriff:</span>
                  {terms.map((term) => (
                    <Link
                      key={term}
                      href={analyseUrl({
                        terms,
                        jurisdictions: selectedJurisdictions,
                        minYear: minYearStr,
                        maxYear: maxYearStr,
                        fokus: term,
                      })}
                      aria-current={term === fokus ? 'true' : undefined}
                      className={
                        term === fokus
                          ? 'px-3 py-1 rounded-full bg-blue-700 text-white font-medium'
                          : 'px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors'
                      }
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950" />
                  0
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/30" />
                  1-2
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-blue-200 dark:bg-blue-800/40" />
                  3-5
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-blue-400 dark:bg-blue-700/60" />
                  6-15
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-blue-600 dark:bg-blue-600/80" />
                  16-40
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-blue-800 dark:bg-blue-500" />
                  40+
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded cell-not-published bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700" />
                  Nicht erschienen
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-5 h-5 rounded bg-gray-100 dark:bg-gray-800" />
                  Bericht fehlt
                </div>
              </div>
            </div>
          </section>

          <section className="pb-10">
            <div className="max-w-6xl mx-auto px-6 overflow-x-auto">
              <Heatmap
                mentionsData={mentionsData}
                years={heatmapYears}
                highlighted={selectedJurisdictions}
              />
            </div>
          </section>

          {/* CSV Export */}
          <section className="pb-10">
            <div className="max-w-6xl mx-auto px-6">
              <a
                href={csvUrl}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
                Als CSV exportieren
              </a>
            </div>
          </section>
        </>
      )}

      {/* Methodology Note */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mt-12 leading-relaxed">
            Hinweis zur Methodik: Der Zeitverlauf zeigt die relative Häufigkeit — absolute
            Erwähnungen pro Jahr dividiert durch die Gesamtzahl aller Wörter in dem Jahr; er
            beginnt 1993, da ältere Jahrgänge nicht ausreichend abgedeckt sind. Die Heatmap
            zählt die Seiten, auf denen der Begriff vorkommt, und reicht weiter zurück.
          </p>
        </div>
      </section>
    </>
  )
}
