import { cn } from '@/lib/utils'
import FilterBar from './FilterBar'

interface FilterPanelProps {
  /** Form target, e.g. "/suche" — forwarded to FilterBar. */
  action: string
  className?: string
  children: React.ReactNode
}

/**
 * Shared visual container for filter forms (server component): the gray
 * rounded box used across all filter pages. Rows are composed by the
 * page (typically `flex flex-wrap items-end gap-3` per row) so single-
 * and multi-row layouts both work.
 */
export default function FilterPanel({ action, className, children }: FilterPanelProps) {
  return (
    <FilterBar action={action} className={className}>
      <div className={cn('bg-gray-50 dark:bg-gray-900 rounded-xl p-6 space-y-4')}>
        {children}
      </div>
    </FilterBar>
  )
}
