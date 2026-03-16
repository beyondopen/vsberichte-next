import type { Metadata } from 'next'
import { getMentions } from '@/lib/queries/mentions'
import { jurisdictions } from '@/lib/jurisdictions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Regionale Analyse -- Verfassungsschutzberichte.de',
  description:
    'Vergleiche Erwaehnungen von Begriffen ueber alle Bundeslaender und Jahre hinweg.',
}

interface RegionalPageProps {
  searchParams: Promise<{
    q?: string
    min_year?: string
    max_year?: string
  }>
}

/** Map a count to one of 5 blue intensity tiers */
function heatmapTier(count: number): number {
  if (count <= 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 15) return 3
  if (count <= 40) return 4
  return 5
}

function heatmapClasses(count: number): string {
  if (count === -2) return 'cell-not-published bg-gray-50 dark:bg-gray-900'
  if (count === -1) return 'bg-gray-100 dark:bg-gray-800'
  const tier = heatmapTier(count)
  switch (tier) {
    case 0:
      return 'bg-white dark:bg-gray-950'
    case 1:
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200'
    case 2:
      return 'bg-blue-200 dark:bg-blue-800/40 text-blue-900 dark:text-blue-100'
    case 3:
      return 'bg-blue-400 dark:bg-blue-700/60 text-white'
    case 4:
      return 'bg-blue-600 dark:bg-blue-600/80 text-white'
    case 5:
      return 'bg-blue-800 dark:bg-blue-500 text-white'
    default:
      return ''
  }
}

function cellLabel(count: number): string {
  if (count === -2) return ''
  if (count === -1) return '\u2013'
  return String(count)
}

function cellTitle(jurisdiction: string, year: number, count: number): string {
  if (count === -2) return `${jurisdiction} ${year}: Nicht erschienen`
  if (count === -1) return `${jurisdiction} ${year}: Bericht fehlt`
  return `${jurisdiction} ${year}: ${count} Treffer`
}

export default async function RegionalPage({ searchParams }: RegionalPageProps) {
  const params = await searchParams
  const q = params.q ?? ''
  const hasQuery = q.length > 0

  const minYearStr = params.min_year || ''
  const maxYearStr = params.max_year || ''
  const minYear = minYearStr ? parseInt(minYearStr, 10) : null
  const maxYear = maxYearStr ? parseInt(maxYearStr, 10) : null

  let mentionsData: Record<string, Record<number, number>> | null = null
  let years: number[] = []

  if (hasQuery) {
    mentionsData = await getMentions(q, {
      minYear: isNaN(minYear as number) ? null : minYear,
      maxYear: isNaN(maxYear as number) ? null : maxYear,
    })

    // Collect all years across all jurisdictions
    const yearSet = new Set<number>()
    for (const jurData of Object.values(mentionsData)) {
      for (const y of Object.keys(jurData)) {
        yearSet.add(parseInt(y, 10))
      }
    }
    years = Array.from(yearSet).sort((a, b) => a - b)
  }

  // Build CSV export URL
  const csvParams = new URLSearchParams()
  if (q) csvParams.set('q', q)
  if (minYearStr) csvParams.set('min_year', minYearStr)
  if (maxYearStr) csvParams.set('max_year', maxYearStr)
  csvParams.set('csv', '1')
  const csvUrl = `/api/mentions?${csvParams.toString()}`

  return (
    <>
      {/* Page Header */}
      <section className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif font-bold text-4xl tracking-tight mb-2">
            Regionale Analyse
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Vergleiche Erwaehnungen ueber Bundeslaender und Jahre
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            Wie oft taucht ein Begriff in den Verfassungsschutzberichten der einzelnen Bundeslaender
            auf? Die Heatmap zeigt die Anzahl der Seiten, auf denen der Suchbegriff vorkommt.
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <form action="/regional" method="get">
            <div className="flex gap-3 mb-4">
              <label htmlFor="regional-input" className="sr-only">
                Suchbegriff
              </label>
              <input
                id="regional-input"
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Suchbegriff eingeben..."
                className="flex-1 max-w-md px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Analysieren
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Heatmap */}
      {hasQuery && mentionsData && years.length > 0 && (
        <>
          <section className="pb-6">
            <div className="max-w-6xl mx-auto px-6">
              <h2 className="font-bold text-lg mb-4">
                Erwaehnungen von &bdquo;{q}&ldquo; nach Region und Jahr
              </h2>

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
              <table className="heatmap-table text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="row-header bg-white dark:bg-gray-950 px-3 py-2 text-left font-semibold text-gray-900 dark:text-gray-100 min-w-[160px]">
                      Land
                    </th>
                    {years.map((year) => (
                      <th
                        key={year}
                        className="px-1.5 py-2 text-center font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap"
                      >
                        {String(year).slice(2)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jurisdictions.map((jur) => {
                    const jurData = mentionsData![jur]
                    if (!jurData) return null
                    return (
                      <tr key={jur} className="border-t border-gray-100 dark:border-gray-800/50">
                        <th className="row-header bg-white dark:bg-gray-950 px-3 py-1.5 text-left font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {jur}
                        </th>
                        {years.map((year) => {
                          const count = jurData[year] ?? -2
                          return (
                            <td
                              key={year}
                              className={`px-1.5 py-1.5 text-center font-mono tabular-nums ${heatmapClasses(count)}`}
                              title={cellTitle(jur, year, count)}
                            >
                              {cellLabel(count)}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* CSV Export */}
          <section className="pb-20">
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .heatmap-table th.row-header {
              position: sticky;
              left: 0;
              z-index: 10;
            }
            .cell-not-published {
              background-image: repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 3px,
                rgba(156, 163, 175, 0.25) 3px,
                rgba(156, 163, 175, 0.25) 6px
              );
            }
            .dark .cell-not-published {
              background-image: repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 3px,
                rgba(75, 85, 99, 0.4) 3px,
                rgba(75, 85, 99, 0.4) 6px
              );
            }
          `,
        }}
      />
    </>
  )
}
