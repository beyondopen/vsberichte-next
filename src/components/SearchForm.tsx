'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchFormProps {
  defaultValue?: string
  size?: 'sm' | 'lg'
}

export default function SearchForm({
  defaultValue = '',
  size = 'sm',
}: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)
  const router = useRouter()

  const fetchSuggestions = useCallback((q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auto-complete?q=${encodeURIComponent(q)}`)
        if (!res.ok) return
        const data: string[] = await res.json()
        setSuggestions(data)
        setShowDropdown(data.length > 0)
        setActiveIndex(-1)
      } catch {
        // ignore
      }
    }, 200)
  }, [])

  const submitSearch = useCallback(
    (q: string) => {
      setShowDropdown(false)
      if (q.trim()) {
        router.push(`/suche?q=${encodeURIComponent(q.trim())}`)
      }
    },
    [router]
  )

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      submitSearch(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

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
            onChange={(e) => {
              setQuery(e.target.value)
              fetchSuggestions(e.target.value)
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true)
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            aria-controls="autocomplete-list"
            className={inputClass}
          />
          {/* Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <ul
              id="autocomplete-list"
              role="listbox"
              className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
            >
              {suggestions.map((suggestion, i) => (
                <li
                  key={suggestion}
                  role="option"
                  aria-selected={i === activeIndex}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    i === activeIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onMouseDown={() => submitSearch(suggestion)}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className={buttonClass}>
          Suchen
        </button>
      </form>
    </div>
  )
}
