import { Ticket } from '../types/ticket'
import { TicketCard } from './TicketCard'
import { LoadingSpinner } from './LoadingSpinner'
import './TicketList.css'

interface TicketListProps {
  tickets: Ticket[]
  fetchLoading: boolean
  actionTicketId: string | null
  hasOpenTickets: boolean
  onAssign: (ticketId: string) => Promise<boolean>
  onAssignNext: () => Promise<boolean>
  onResolve: (ticketId: string) => Promise<boolean>
  filterActive: string
}

export function TicketList({
  tickets,
  fetchLoading,
  actionTicketId,
  hasOpenTickets,
  onAssign,
  onAssignNext,
  onResolve,
  filterActive,
}: TicketListProps) {
  const isEmpty = tickets.length === 0
  const isAssigningNext = actionTicketId !== null

  return (
    <div className="ticket-list">
      <div className="ticket-list__header">
        <h2 className="ticket-list__title">
          Ticket Queue
          <span className="ticket-list__count">({tickets.length})</span>
        </h2>
        <button
          type="button"
          id="assign-next-btn"
          name="assign-next"
          className="btn btn--primary btn--assign-next"
          onClick={onAssignNext}
          disabled={isAssigningNext || !hasOpenTickets}
        >
          {isAssigningNext ? 'Assigning...' : 'Assign Next'}
        </button>
      </div>

      {fetchLoading && isEmpty && (
        <div className="ticket-list__loading">
          <LoadingSpinner />
          <p>Loading tickets...</p>
        </div>
      )}

      {!fetchLoading && isEmpty && (
        <div className="ticket-list__empty">
          <p className="ticket-list__empty-text">
            {filterActive === 'All'
              ? 'No tickets in the queue. Create a new ticket to get started.'
              : `No ${filterActive.toLowerCase()} tickets found.`}
          </p>
        </div>
      )}

      {!isEmpty && (
        <div className="ticket-list__grid">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onAssign={onAssign}
              onResolve={onResolve}
              loading={actionTicketId === ticket.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
