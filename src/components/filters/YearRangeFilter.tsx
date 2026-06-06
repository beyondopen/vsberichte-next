'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import { Slider } from '@/components/ui/slider'
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

interface YearRangeFilterProps {
  /** Lower bound of the selectable range (YEAR_MIN). */
  minLimit: number
  /** Upper bound — pass the current year from the server component. */
  maxLimit: number
  /** Current min_year URL param value. */
  defaultMin?: string
  /** Current max_year URL param value. */
  defaultMax?: string
  label?: string
  /** Visible label above the control (default); set false for sr-only. */
  labelVisible?: boolean
  className?: string
}

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), hi)
}

/** '' when the value equals its limit: full extent = no URL constraint. */
function normalize(value: number, limit: number, isMin: boolean): string {
  if (isMin ? value <= limit : value >= limit) return ''
  return String(value)
}

/**
 * Year range as a dual-thumb slider bound to two native number inputs.
 *
 * The inputs (`min_year`/`max_year`) are the actual form fields — they are
 * the no-JS fallback and allow precise keyboard entry. The slider is
 * rendered only after mount; on commit (thumb release) it writes into the
 * inputs and dispatches a `change` event that AutoSubmit picks up.
 */
export default function YearRangeFilter({
  minLimit,
  maxLimit,
  defaultMin = '',
  defaultMax = '',
  label = 'Zeitraum',
  labelVisible = true,
  className,
}: YearRangeFilterProps) {
  const [minValue, setMinValue] = useState(defaultMin)
  const [maxValue, setMaxValue] = useState(defaultMax)
  const mounted = useMounted()
  const minRef = useRef<HTMLInputElement>(null)
  const maxRef = useRef<HTMLInputElement>(null)

  const sliderValue = [
    clamp(parseInt(minValue, 10) || minLimit, minLimit, maxLimit),
    clamp(parseInt(maxValue, 10) || maxLimit, minLimit, maxLimit),
  ]

  function handleSliderChange([lo, hi]: number[]) {
    setMinValue(normalize(lo, minLimit, true))
    setMaxValue(normalize(hi, maxLimit, false))
  }

  function handleSliderCommit([lo, hi]: number[]) {
    const nextMin = normalize(lo, minLimit, true)
    const nextMax = normalize(hi, maxLimit, false)
    setMinValue(nextMin)
    setMaxValue(nextMax)
    // Write straight into the DOM so the dispatched event sees the final
    // values regardless of React's render timing; AutoSubmit navigates.
    if (minRef.current && maxRef.current) {
      minRef.current.value = nextMin
      maxRef.current.value = nextMax
      minRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }

  const inputClass = cn(
    'w-20 px-2 py-2.5 border border-input rounded-lg text-center',
    'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm tabular-nums',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
  )

  return (
    <div className={className}>
      <span
        className={
          labelVisible
            ? 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'
            : 'sr-only'
        }
      >
        {label}
      </span>
      <div role="group" aria-label={label} className="flex items-center gap-3">
        <label htmlFor="filter-min-year" className="sr-only">
          Von Jahr
        </label>
        {/* No min/max attributes: years outside the data bounds are valid
            queries (just unconstrained) — native validation would silently
            block the no-JS GET submit. */}
        <input
          ref={minRef}
          id="filter-min-year"
          type="number"
          inputMode="numeric"
          name="min_year"
          placeholder={String(minLimit)}
          value={minValue}
          onChange={(e) => setMinValue(e.target.value)}
          className={inputClass}
        />
        <div className="w-28 sm:w-36 flex items-center">
          {mounted ? (
            <Slider
              value={sliderValue}
              min={minLimit}
              max={maxLimit}
              step={1}
              onValueChange={handleSliderChange}
              onValueCommit={handleSliderCommit}
              aria-label={label}
            />
          ) : (
            // Static placeholder pre-hydration / without JS: same height as
            // the slider track so nothing shifts when it mounts.
            <div aria-hidden className="h-1 w-full rounded-full bg-muted" />
          )}
        </div>
        <label htmlFor="filter-max-year" className="sr-only">
          Bis Jahr
        </label>
        <input
          ref={maxRef}
          id="filter-max-year"
          type="number"
          inputMode="numeric"
          name="max_year"
          placeholder={String(maxLimit)}
          value={maxValue}
          onChange={(e) => setMaxValue(e.target.value)}
          className={inputClass}
        />
      </div>
    </div>
  )
}
