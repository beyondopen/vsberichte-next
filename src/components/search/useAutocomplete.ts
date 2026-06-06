'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'

interface UseAutocompleteOptions {
  /** Called when a suggestion is committed (click or Enter on an active option). */
  onSelect: (value: string) => void
  /**
   * Host-owned wrapper element around input + dropdown; clicks outside it
   * close the list. Passed in (not returned) so the hook's return object
   * carries no ref — the react-hooks/refs lint rule would otherwise flag
   * every property access on it during render.
   */
  wrapperRef: React.RefObject<HTMLDivElement | null>
  /** Minimum characters before suggestions are fetched. */
  minChars?: number
  /** Pause after typing before the suggestion fetch fires. */
  debounceMs?: number
}

/**
 * Headless autocomplete logic shared by the homepage SearchForm, the /suche
 * SearchInput and the /analyse term input (extracted from SearchForm).
 *
 * Owns fetch (debounced, aborting stale requests), open/close state,
 * keyboard navigation and the editable-combobox ARIA wiring. It does NOT
 * own the input value — hosts keep their own value model (controlled or
 * uncontrolled), which keeps the no-JS form fallback untouched.
 *
 * The key coexistence rule: Enter is only intercepted (preventDefault +
 * onSelect) while an option is actively highlighted; otherwise it bubbles
 * to the form so each host's native submit semantics apply.
 */
export function useAutocomplete({
  onSelect,
  wrapperRef,
  minChars = 2,
  debounceMs = 200,
}: UseAutocompleteOptions) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const listId = useId()

  const optionId = useCallback((i: number) => `${listId}-option-${i}`, [listId])

  const close = useCallback(() => {
    setOpen(false)
    setActiveIndex(-1)
  }, [])

  /** Debounced suggestion fetch for the current input text. */
  const query = useCallback(
    (q: string) => {
      if (timer.current) clearTimeout(timer.current)
      if (q.trim().length < minChars) {
        abortRef.current?.abort()
        setSuggestions([])
        setOpen(false)
        setActiveIndex(-1)
        return
      }
      timer.current = setTimeout(async () => {
        // Abort the previous in-flight fetch so a slow early response
        // can't overwrite a newer one.
        abortRef.current?.abort()
        const controller = new AbortController()
        abortRef.current = controller
        try {
          const res = await fetch(`/api/auto-complete?q=${encodeURIComponent(q)}`, {
            signal: controller.signal,
          })
          if (!res.ok) return
          const data: string[] = await res.json()
          setSuggestions(data)
          setOpen(data.length > 0)
          setActiveIndex(-1)
        } catch {
          // aborted or network error — ignore
        }
      }, debounceMs)
    },
    [minChars, debounceMs]
  )

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
      abortRef.current?.abort()
    }
  }, [])

  // Close on outside click (mousedown, so option onMouseDown still wins)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [close, wrapperRef])

  const pick = useCallback(
    (value: string) => {
      close()
      onSelect(value)
    },
    [close, onSelect]
  )

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pick(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      close()
    }
  }

  /**
   * Spread onto the host's <input>. Hosts with their own onInput handler
   * must compose: call inputProps.onInput first, then their own logic.
   */
  const inputProps = {
    role: 'combobox' as const,
    'aria-expanded': open,
    'aria-autocomplete': 'list' as const,
    'aria-controls': listId,
    'aria-activedescendant':
      open && activeIndex >= 0 ? optionId(activeIndex) : undefined,
    autoComplete: 'off' as const,
    onInput: (e: React.FormEvent<HTMLInputElement>) => query(e.currentTarget.value),
    onFocus: () => {
      if (suggestions.length > 0) setOpen(true)
    },
    onKeyDown,
  }

  return {
    suggestions,
    open,
    activeIndex,
    setActiveIndex,
    listId,
    optionId,
    inputProps,
    pick,
    close,
  }
}
