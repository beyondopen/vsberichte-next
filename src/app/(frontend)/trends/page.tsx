import type { Metadata } from 'next'
import { getTermStats } from '@/lib/queries/stats'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Trends -- Verfassungsschutzberichte.de',
  description: 'Vergleiche Begriffe im zeitlichen Verlauf in den Verfassungsschutzberichten.',
}

interface TrendsPageProps {
  searchParams: Promise<{
    q?: string | string[]
    term?: string
    remove?: string
  }>
}

export default async function TrendsPage({ searchParams }: TrendsPageProps) {
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

  // Handle removing a term
  if (params.remove) {
    terms = terms.filter((t) => t !== params.remove)
  }

  // Fetch stats for all active terms
  const statsData: [string, Record<number, number>][] = []
  if (terms.length > 0) {
    for (const term of terms.slice(0, 5)) {
      const data = await getTermStats(term)
      statsData.push(data)
    }
  }

  // Collect all years for the data table
  const allYears = new Set<number>()
  for (const [, yearData] of statsData) {
    for (const year of Object.keys(yearData)) {
      allYears.add(parseInt(year, 10))
    }
  }
  const sortedYears = Array.from(allYears).sort((a, b) => a - b)

  // Build URL helper for hidden term inputs
  function buildTermsUrl(termsToKeep: string[]): string {
    const p = new URLSearchParams()
    for (const t of termsToKeep) {
      p.append('q', t)
    }
    return `/trends?${p.toString()}`
  }

  // Suggestions
  const suggestions = ['linksextrem', 'rechtsextrem', 'cyber', 'internet', 'NPD', 'PKK']

  return (
    <>
      {/* Page Header */}
      <section className="pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="font-serif font-bold text-4xl tracking-tight mb-2">Trends</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            Vergleiche Begriffe im zeitlichen Verlauf
          </p>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            Wie oft werden bestimmte Begriffe in den Verfassungsschutzberichten erwaehnt? Die Trends
            zeigen die relative Haeufigkeit von Begriffen ueber die Jahre. Vergleiche bis zu fuenf
            Begriffe gleichzeitig.
          </p>
        </div>
      </section>

      {/* Search Form */}
      <section className="pb-10">
        <div className="max-w-6xl mx-auto px-6">
          {/* Add term form */}
          <form action="/trends" method="get" className="mb-4">
            {/* Carry existing terms as hidden fields */}
            {terms.map((t) => (
              <input key={t} type="hidden" name="q" value={t} />
            ))}
            <div className="flex gap-3">
              <label htmlFor="term-input" className="sr-only">
                Begriff eingeben
              </label>
              <input
                id="term-input"
                type="text"
                name="term"
                placeholder="Begriff eingeben..."
                className="flex-1 max-w-md px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
              >
                Hinzufuegen
              </button>
            </div>
          </form>

          {/* Active search term pills */}
          {terms.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {terms.map((term) => {
                const remaining = terms.filter((t) => t !== term)
                const removeUrl = buildTermsUrl(remaining)
                return (
                  <span
                    key={term}
                    className="inline-flex items-center gap-1.5 pl-3.5 pr-1.5 py-1.5 bg-blue-700 text-white text-sm font-medium rounded-full"
                  >
                    {term}
                    <a
                      href={removeUrl}
                      aria-label={`${term} entfernen`}
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </a>
                  </span>
                )
              })}
            </div>
          )}

          {/* Suggestions */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Vorschlaege:</span>
            {suggestions
              .filter((s) => !terms.includes(s))
              .map((suggestion) => {
                const url = buildTermsUrl([...terms, suggestion])
                return (
                  <a
                    key={suggestion}
                    href={url}
                    className="text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    {suggestion}
                  </a>
                )
              })}
          </div>
        </div>
      </section>

      {/* Chart Area */}
      {terms.length > 0 && (
        <section className="pb-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h2 className="font-bold text-lg mb-1">
                Relative Haeufigkeit: {terms.join(', ')}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Alle Berichte
                {sortedYears.length > 0 &&
                  `, ${sortedYears[0]}\u2013${sortedYears[sortedYears.length - 1]}`}
              </p>

              {/* Chart placeholder */}
              <div
                id="trends-chart"
                className="h-80 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center"
                data-stats={JSON.stringify(statsData)}
              >
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Interaktiver Chart wird mit JavaScript geladen
                </p>
              </div>
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

      {/* Methodology Note */}
      <section className="pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mt-12 leading-relaxed">
            Hinweis zur Methodik: Die relative Haeufigkeit wird berechnet, indem die absoluten
            Erwaehnungen pro Jahr durch die Gesamtzahl aller Woerter in dem Jahr dividiert werden.
            Dies normalisiert die Werte, da nicht fuer alle Jahre gleich viele Berichte vorliegen.
          </p>
        </div>
      </section>
    </>
  )
}
