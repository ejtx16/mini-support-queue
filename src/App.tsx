import { useEffect, useState } from 'react'
import { useTickets } from './hooks/useTickets'
import { CreateTicketForm } from './components/CreateTicketForm'
import { TicketList } from './components/TicketList'
import { StatusFilter } from './components/StatusFilter'
import { Toast } from './components/Toast'
import './App.css'

function App() {
  const {
    tickets,
    allTickets,
    fetchLoading,
    createLoading,
    actionTicketId,
    error,
    filter,
    hasOpenTickets,
    fetchTickets,
    createTicket,
    assignTicket,
    assignNextTicket,
    resolveTicket,
    setFilter,
    clearError,
  } = useTickets()

  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleCreateTicket = async (data: Parameters<typeof createTicket>[0]) => {
    const success = await createTicket(data)
    if (success) {
      setSuccessMessage('Ticket created successfully!')
    }
    return success
  }

  const handleAssignTicket = async (ticketId: string) => {
    const success = await assignTicket(ticketId)
    if (success) {
      setSuccessMessage('Ticket assigned successfully!')
    }
    return success
  }

  const handleAssignNext = async () => {
    const success = await assignNextTicket()
    if (success) {
      setSuccessMessage('Next ticket assigned successfully!')
    }
    return success
  }

  const handleResolveTicket = async (ticketId: string) => {
    const success = await resolveTicket(ticketId)
    if (success) {
      setSuccessMessage('Ticket resolved successfully!')
    }
    return success
  }

  const ticketCounts = {
    all: allTickets.length,
    open: allTickets.filter((t) => t.status === 'Open').length,
    assigned: allTickets.filter((t) => t.status === 'Assigned').length,
    resolved: allTickets.filter((t) => t.status === 'Resolved').length,
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header__content">
          <h1 className="app-header__title">Mini Support Queue</h1>
          <p className="app-header__subtitle">Agent: agent-1</p>
        </div>
      </header>

      <main className="app-main">
        <aside className="app-sidebar">
          <CreateTicketForm onSubmit={handleCreateTicket} loading={createLoading} />
        </aside>

        <section className="app-content">
          <StatusFilter
            activeFilter={filter}
            onFilterChange={setFilter}
            ticketCounts={ticketCounts}
          />

          <TicketList
            tickets={tickets}
            fetchLoading={fetchLoading}
            actionTicketId={actionTicketId}
            hasOpenTickets={hasOpenTickets}
            onAssign={handleAssignTicket}
            onAssignNext={handleAssignNext}
            onResolve={handleResolveTicket}
            filterActive={filter}
          />
        </section>
      </main>

      {error && (
        <Toast message={error} type="error" onClose={clearError} duration={5000} />
      )}

      {successMessage && (
        <Toast
          message={successMessage}
          type="success"
          onClose={() => setSuccessMessage(null)}
        />
      )}
    </div>
  )
}

export default App
