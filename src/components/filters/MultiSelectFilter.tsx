'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'

const emptySubscribe = () => () => {}

/** false during SSR and hydration, true afterwards — lint-clean mounted check. */
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

interface MultiSelectFilterProps {
  id: string
  name: string
  label: string
  /** Visible label above the control (default); set false for sr-only. */
  labelVisible?: boolean
  /** Trigger text when nothing is selected, e.g. "Alle Behörden". */
  allLabel: string
  /** Noun for the "N <countNoun>" trigger text from 3 selections up. */
  countNoun?: string
  options: string[]
  /** Current selection (normalized server-side). */
  selected: string[]
  className?: string
}

/**
 * Multi-select filter: combobox (Popover + Command) with check-marked
 * options, backed by hidden form inputs (client leaf).
 *
 * Form state = one hidden `<input name={name}>` per selected option, so
 * `FormData` → `buildFilterUrl` → AutoSubmit work unchanged and the URL
 * carries repeated params (`?jurisdiction=Bund&jurisdiction=Bayern`).
 * Toggling updates the hidden inputs synchronously (flushSync) and then
 * dispatches a bubbling `change` event — AutoSubmit navigates.
 *
 * Before hydration / without JavaScript a native `<select multiple>` is
 * rendered instead: it submits the identical repeated params on a plain
 * GET, same swap-after-mount approach as YearRangeFilter's slider.
 */
export default function MultiSelectFilter({
  id,
  name,
  label,
  labelVisible = true,
  allLabel,
  countNoun = 'ausgewählt',
  options,
  selected,
  className,
}: MultiSelectFilterProps) {
  // Display order always follows the options list ("Bund" first), no
  // matter whether the selection came from the URL or from toggling.
  const sortByOptions = (arr: string[]) =>
    [...arr].sort((a, b) => options.indexOf(a) - options.indexOf(b))

  const [values, setValues] = useState(() => sortByOptions(selected))
  const [open, setOpen] = useState(false)
  const mounted = useMounted()
  const wrapperRef = useRef<HTMLDivElement>(null)

  function applyValues(next: string[]) {
    // Hidden inputs must be in the DOM before AutoSubmit reads FormData
    flushSync(() => setValues(next))
    wrapperRef.current?.dispatchEvent(new Event('change', { bubbles: true }))
  }

  function toggle(option: string) {
    const next = values.includes(option)
      ? values.filter((v) => v !== option)
      : sortByOptions([...values, option])
    applyValues(next)
  }

  const triggerLabel =
    values.length === 0
      ? allLabel
      : values.length <= 2
        ? values.join(', ')
        : `${values.length} ${countNoun}`

  const labelClass = labelVisible
    ? 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'
    : 'sr-only'

  const controlClass = cn(
    'appearance-none w-full pl-4 pr-9 py-2.5 border border-input rounded-lg',
    'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
  )

  if (!mounted) {
    // Pre-hydration / no-JS fallback: a native multiple select submits the
    // same repeated params via plain GET. Empty selection = no param = all.
    return (
      <div className={className}>
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        <select
          id={id}
          name={name}
          multiple
          size={6}
          defaultValue={selected}
          className={cn(controlClass, 'pr-4')}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div ref={wrapperRef} className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {values.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          aria-label={label}
          className={cn(controlClass, 'relative min-w-44 text-left')}
        >
          <span className="block truncate">{triggerLabel}</span>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-1">
          <Command>
            <CommandInput placeholder={`${label} filtern…`} />
            <CommandList>
              <CommandEmpty>Nichts gefunden.</CommandEmpty>
              <CommandItem
                data-checked={values.length === 0}
                onSelect={() => applyValues([])}
              >
                {allLabel}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  data-checked={values.includes(option)}
                  onSelect={() => toggle(option)}
                >
                  {option}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
