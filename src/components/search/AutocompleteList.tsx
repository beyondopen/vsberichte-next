'use client'

interface AutocompleteListProps {
  suggestions: string[]
  open: boolean
  activeIndex: number
  listId: string
  optionId: (i: number) => string
  /** Commit a suggestion (wired to useAutocomplete's pick). */
  onPick: (value: string) => void
  /** Highlight an option on hover (wired to setActiveIndex). */
  onHover: (i: number) => void
}

/**
 * Suggestion dropdown for useAutocomplete (presentational only).
 *
 * Rendered inside a `relative` wrapper around the input. Selection uses
 * onMouseDown (not onClick) so it fires before the input's blur closes
 * the list — same behavior the SearchForm dropdown always had.
 */
export default function AutocompleteList({
  suggestions,
  open,
  activeIndex,
  listId,
  optionId,
  onPick,
  onHover,
}: AutocompleteListProps) {
  if (!open || suggestions.length === 0) return null

  return (
    <ul
      id={listId}
      role="listbox"
      className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
    >
      {suggestions.map((suggestion, i) => (
        <li
          key={suggestion}
          id={optionId(i)}
          role="option"
          aria-selected={i === activeIndex}
          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
            i === activeIndex
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          onMouseDown={() => onPick(suggestion)}
          onMouseEnter={() => onHover(i)}
        >
          {suggestion}
        </li>
      ))}
    </ul>
  )
}
