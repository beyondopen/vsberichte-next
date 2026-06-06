import { jurisdictions } from '@/lib/jurisdictions'

interface HeatmapProps {
  /** getMentions() result: jurisdiction → year → count (-2 not published, -1 missing). */
  mentionsData: Record<string, Record<number, number>>
  /** Sorted years to render as columns. */
  years: number[]
  /**
   * Jurisdictions to emphasize (the chart's Behörden selection). Only the
   * row header is accented — cell colors stay untouched so the comparison
   * reading is unaffected.
   */
  highlighted?: string[]
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
  if (count === -1) return '–'
  return String(count)
}

function cellTitle(jurisdiction: string, year: number, count: number): string {
  if (count === -2) return `${jurisdiction} ${year}: Nicht erschienen`
  if (count === -1) return `${jurisdiction} ${year}: Bericht fehlt`
  return `${jurisdiction} ${year}: ${count} Treffer`
}

/**
 * Jurisdictions × years heatmap of term mentions (server component).
 * Extracted from the former /regional page; used on /analyse.
 */
export default function Heatmap({ mentionsData, years, highlighted = [] }: HeatmapProps) {
  return (
    <>
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
            const jurData = mentionsData[jur]
            if (!jurData) return null
            const isHighlighted = highlighted.includes(jur)
            return (
              <tr
                key={jur}
                data-highlighted={isHighlighted || undefined}
                className="border-t border-gray-100 dark:border-gray-800/50"
              >
                <th
                  className={
                    isHighlighted
                      ? 'row-header bg-white dark:bg-gray-950 px-3 py-1.5 text-left font-bold text-blue-700 dark:text-blue-400 whitespace-nowrap border-l-2 border-blue-600 dark:border-blue-400'
                      : 'row-header bg-white dark:bg-gray-950 px-3 py-1.5 text-left font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap'
                  }
                >
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
