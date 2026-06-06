import { cn } from '@/lib/utils'

interface Option {
  value: string
  label: string
}

interface SelectFilterProps {
  id: string
  name: string
  label: string
  /** Visible label above the control (default); set false for sr-only. */
  labelVisible?: boolean
  /** Text for an "all" option with empty value, e.g. "Alle Behörden". Omit to skip. */
  allLabel?: string
  options: (Option | string)[]
  defaultValue?: string
  className?: string
}

/**
 * Styled native `<select>` (server component, zero client JS).
 *
 * Deliberately native: best mobile UX, accessible for free, works without
 * JavaScript. Instant apply comes from the native `change` event bubbling
 * to AutoSubmit.
 */
export default function SelectFilter({
  id,
  name,
  label,
  labelVisible = true,
  allLabel,
  options,
  defaultValue = '',
  className,
}: SelectFilterProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={
          labelVisible
            ? 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'
            : 'sr-only'
        }
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue}
          className={cn(
            'appearance-none w-full pl-4 pr-9 py-2.5 border border-input rounded-lg',
            'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent'
          )}
        >
          {allLabel !== undefined && <option value="">{allLabel}</option>}
          {options.map((option) => {
            const { value, label: optionLabel } =
              typeof option === 'string' ? { value: option, label: option } : option
            return (
              <option key={value} value={value}>
                {optionLabel}
              </option>
            )
          })}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
