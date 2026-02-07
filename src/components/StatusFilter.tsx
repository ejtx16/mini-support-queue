import { TicketStatus } from '../types/ticket'
import './StatusFilter.css'

type FilterOption = TicketStatus | 'All'

interface StatusFilterProps {
  activeFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
  ticketCounts: {
    all: number
    open: number
    assigned: number
    resolved: number
  }
}

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Open', label: 'Open' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Resolved', label: 'Resolved' },
]

export function StatusFilter({
  activeFilter,
  onFilterChange,
  ticketCounts,
}: StatusFilterProps) {
  const getCount = (filter: FilterOption): number => {
    switch (filter) {
      case 'All':
        return ticketCounts.all
      case 'Open':
        return ticketCounts.open
      case 'Assigned':
        return ticketCounts.assigned
      case 'Resolved':
        return ticketCounts.resolved
      default:
        return 0
    }
  }

  return (
    <div className="status-filter" role="tablist" aria-label="Filter tickets by status">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          id={`filter-${option.value.toLowerCase()}`}
          name={`filter-${option.value.toLowerCase()}`}
          role="tab"
          aria-selected={activeFilter === option.value}
          className={`status-filter__btn ${
            activeFilter === option.value ? 'status-filter__btn--active' : ''
          }`}
          onClick={() => onFilterChange(option.value)}
        >
          {option.label}
          <span className="status-filter__count">{getCount(option.value)}</span>
        </button>
      ))}
    </div>
  )
}
