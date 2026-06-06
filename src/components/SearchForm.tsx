'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAutocomplete } from '@/components/search/useAutocomplete'
import AutocompleteList from '@/components/search/AutocompleteList'

interface SearchFormProps {
  defaultValue?: string
  size?: 'sm' | 'lg'
}

/**
 * Homepage search: controlled input that navigates to /suche on submit,
 * with the shared autocomplete dropdown (useAutocomplete). Picking a
 * suggestion navigates immediately. Without JavaScript the plain GET form
 * submits to /suche as before.
 */
export default function SearchForm({
  defaultValue = '',
  size = 'sm',
}: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  const submitSearch = useCallback(
    (q: string) => {
      if (q.trim()) {
        router.push(`/suche?q=${encodeURIComponent(q.trim())}`)
      }
    },
    [router]
  )

  const wrapperRef = useRef<HTMLDivElement>(null)
  const ac = useAutocomplete({ onSelect: submitSearch, wrapperRef })

  const inputClass =
    size === 'lg'
      ? 'flex-1 px-5 py-3.5 rounded-lg text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300'
      : 'flex-1 px-4 py-2.5 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  const buttonClass =
    size === 'lg'
      ? 'px-6 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors'
      : 'px-5 py-2.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors'

  return (
    <div ref={wrapperRef} className="relative">
      <form
        action="/suche"
        method="get"
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          ac.close()
          submitSearch(query)
        }}
      >
        <label htmlFor="search-input" className="sr-only">
          Suchbegriff
        </label>
        <div className="relative flex-1">
          <input
            id="search-input"
            name="q"
            type="search"
            placeholder="Suchbegriff eingeben&#8230;"
            value={query}
            {...ac.inputProps}
            onChange={(e) => setQuery(e.target.value)}
            className={inputClass}
          />
          <AutocompleteList
            suggestions={ac.suggestions}
            open={ac.open}
            activeIndex={ac.activeIndex}
            listId={ac.listId}
            optionId={ac.optionId}
            onPick={ac.pick}
            onHover={ac.setActiveIndex}
          />
        </div>
        <button type="submit" className={buttonClass}>
          Suchen
        </button>
      </form>
    </div>
  )
}
