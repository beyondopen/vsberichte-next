import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface TermTagsProps {
  /** Currently active terms (q params). */
  terms: string[]
  /** Suggested terms; already-active ones are filtered out. */
  suggestions: string[]
  basePath?: string
  /** Extra query params to carry in every link (e.g. min_year/max_year). */
  extraParams?: Record<string, string>
}

function termsUrl(
  basePath: string,
  terms: string[],
  extraParams: Record<string, string>
): string {
  const params = new URLSearchParams()
  for (const term of terms) {
    params.append('q', term)
  }
  for (const [key, value] of Object.entries(extraParams)) {
    if (value) params.set(key, value)
  }
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/**
 * Active term pills + suggestions for /analyse (server component).
 *
 * Add/remove are plain links over the q params — they work without
 * JavaScript and as instant client navigation with it.
 */
export default function TermTags({
  terms,
  suggestions,
  basePath = '/analyse',
  extraParams = {},
}: TermTagsProps) {
  return (
    <>
      {terms.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {terms.map((term) => (
            <Badge
              key={term}
              className="h-auto rounded-full bg-blue-700 text-white text-sm font-medium pl-3.5 pr-1.5 py-1.5 gap-1.5"
            >
              {term}
              <Link
                href={termsUrl(basePath, terms.filter((t) => t !== term), extraParams)}
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Link>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400">Vorschläge:</span>
        {suggestions
          .filter((s) => !terms.includes(s))
          .map((suggestion) => (
            <Badge
              key={suggestion}
              variant="outline"
              asChild
              className="h-auto rounded-full text-sm font-normal px-3 py-1 cursor-pointer"
            >
              <Link href={termsUrl(basePath, [...terms, suggestion], extraParams)}>
                {suggestion}
              </Link>
            </Badge>
          ))}
      </div>
    </>
  )
}
