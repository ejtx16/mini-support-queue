import { Ticket } from '../types/ticket'
import './TicketCard.css'

interface TicketCardProps {
  ticket: Ticket
  onAssign: (ticketId: string) => Promise<boolean>
  onResolve: (ticketId: string) => Promise<boolean>
  loading: boolean
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function TicketCard({ ticket, onAssign, onResolve, loading }: TicketCardProps) {
  const isOpen = ticket.status === 'Open'
  const isAssigned = ticket.status === 'Assigned'

  return (
    <article className="ticket-card" data-priority={ticket.priority} data-status={ticket.status}>
      <div className="ticket-card__header">
        <span className={`ticket-badge ticket-badge--${ticket.priority.toLowerCase()}`}>
          {ticket.priority}
        </span>
        <span className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>
          {ticket.status}
        </span>
      </div>

      <h3 className="ticket-card__title">{ticket.title}</h3>
      <p className="ticket-card__description">{ticket.description}</p>

      <div className="ticket-card__footer">
        <span className="ticket-card__date">Created: {formatDate(ticket.createdAt)}</span>
        {ticket.assignee && (
          <span className="ticket-card__assignee">Assigned to: {ticket.assignee}</span>
        )}
      </div>

      <div className="ticket-card__actions">
        {isOpen && (
          <button
            type="button"
            id={`assign-btn-${ticket.id}`}
            name="assign-ticket"
            className="btn btn--secondary"
            onClick={() => onAssign(ticket.id)}
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Assign to me'}
          </button>
        )}
        {isAssigned && (
          <button
            type="button"
            id={`resolve-btn-${ticket.id}`}
            name="resolve-ticket"
            className="btn btn--success"
            onClick={() => onResolve(ticket.id)}
            disabled={loading}
          >
            {loading ? 'Resolving...' : 'Resolve'}
          </button>
        )}
      </div>
    </article>
  )
}
