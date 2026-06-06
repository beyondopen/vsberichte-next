'use client'

import { useRef } from 'react'
import { useAutocomplete } from '@/components/search/useAutocomplete'
import AutocompleteList from '@/components/search/AutocompleteList'

interface TermAutocompleteInputProps {
  id: string
  name?: string
  placeholder?: string
}

/**
 * Term input for /analyse with the shared suggestion dropdown (client leaf).
 *
 * Keeps the `data-filter-manual` contract: typing never auto-applies (a
 * blur must not add half a term) — AutoSubmit only consumes the field on
 * an explicit submit. Picking a suggestion IS an explicit, complete intent,
 * so it fills the input and calls form.requestSubmit(): that fires the
 * `submit` event AutoSubmit listens for, which navigates and clears the
 * field — exactly the existing Enter/"Hinzufügen" flow. Enter without an
 * active option still submits whatever was typed; without JavaScript the
 * plain input + visible button keep working.
 */
export default function TermAutocompleteInput({
  id,
  name = 'term',
  placeholder,
}: TermAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const ac = useAutocomplete({
    wrapperRef,
    onSelect: (value) => {
      const input = inputRef.current
      if (!input) return
      input.value = value
      input.form?.requestSubmit()
    },
  })

  return (
    <div ref={wrapperRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        name={name}
        data-filter-manual=""
        placeholder={placeholder}
        {...ac.inputProps}
        className="w-full px-4 py-2.5 border border-input rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
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
  )
}
