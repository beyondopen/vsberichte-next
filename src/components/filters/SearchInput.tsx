'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAutocomplete } from '@/components/search/useAutocomplete'
import AutocompleteList from '@/components/search/AutocompleteList'

interface SearchInputProps {
  id: string
  name?: string
  /** sr-only label text. */
  label: string
  defaultValue?: string
  placeholder?: string
  size?: 'lg' | 'md'
  /** Pause after typing before filters apply. */
  debounceMs?: number
  /** Show the shared suggestion dropdown (/suche). */
  autocomplete?: boolean
  className?: string
}

/**
 * Debounced text input for filter forms (client leaf).
 *
 * Uncontrolled — the DOM stays the source of truth so the no-JS GET
 * fallback works untouched. After a typing pause it dispatches a bubbling
 * `change` event; AutoSubmit handles the navigation. Enter still submits
 * the form (intercepted by AutoSubmit, instant with JS, full GET without).
 *
 * With `autocomplete` the shared suggestion dropdown (useAutocomplete) is
 * layered on top: suggestions fetch on a faster, independent timer, and
 * picking one is an explicit commit — it writes the input, cancels the
 * pending filter timer and dispatches `change` immediately. Enter only
 * picks while an option is highlighted; otherwise it submits as before.
 */
export default function SearchInput({
  id,
  name = 'q',
  label,
  defaultValue = '',
  placeholder,
  size = 'lg',
  debounceMs = 500,
  autocomplete = false,
  className,
}: SearchInputProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastDispatched = useRef(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const ac = useAutocomplete({
    wrapperRef,
    onSelect: (value) => {
      const input = inputRef.current
      if (!input) return
      // Explicit commit: bypass the filter debounce and apply instantly
      if (timer.current) clearTimeout(timer.current)
      input.value = value
      lastDispatched.current = value
      input.dispatchEvent(new Event('change', { bubbles: true }))
    },
  })

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    if (autocomplete) ac.inputProps.onInput(e)
    const input = e.currentTarget
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (input.value === lastDispatched.current) return
      lastDispatched.current = input.value
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }, debounceMs)
  }

  const input = (
    <input
      ref={inputRef}
      id={id}
      type="search"
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholder}
      {...(autocomplete ? ac.inputProps : {})}
      onInput={handleInput} // composes ac.inputProps.onInput when autocomplete
      className={cn(
        'border border-input rounded-lg bg-white dark:bg-gray-900',
        'text-gray-900 dark:text-gray-100 placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
        size === 'lg' ? 'px-5 py-3.5 text-lg' : 'px-5 py-3 text-base',
        autocomplete ? 'w-full' : 'flex-1',
        className
      )}
    />
  )

  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {autocomplete ? (
        <div ref={wrapperRef} className="relative flex-1">
          {input}
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
      ) : (
        input
      )}
    </>
  )
}
