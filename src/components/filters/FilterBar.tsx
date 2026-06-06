import { cn } from '@/lib/utils'
import AutoSubmit from './AutoSubmit'

interface FilterBarProps {
  /** Form target, e.g. "/suche" — also the GET fallback target. */
  action: string
  className?: string
  children: React.ReactNode
}

/**
 * Shared container for filter forms (server component).
 *
 * Renders a real `<form method="get">` so filtering works without
 * JavaScript; AutoSubmit upgrades it to instant apply after hydration.
 * Layout is left to the children — compose SearchInput, SelectFilter,
 * YearRangeFilter and FilterSubmit per page.
 */
export default function FilterBar({ action, className, children }: FilterBarProps) {
  return (
    <form action={action} method="get" className={className}>
      <AutoSubmit />
      {children}
    </form>
  )
}

interface FilterSubmitProps {
  className?: string
  /**
   * When true (default) the button is hidden once AutoSubmit is active,
   * because filters then apply instantly. Set to false for forms where an
   * explicit action stays meaningful (e.g. adding a term on /trends).
   */
  hideWhenEnhanced?: boolean
  children: React.ReactNode
}

/** Submit button for the no-JS fallback of FilterBar forms. */
export function FilterSubmit({
  className,
  hideWhenEnhanced = true,
  children,
}: FilterSubmitProps) {
  return (
    <button
      type="submit"
      data-filter-submit={hideWhenEnhanced ? '' : undefined}
      className={cn(
        'px-6 py-2.5 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors text-sm whitespace-nowrap',
        className
      )}
    >
      {children}
    </button>
  )
}
