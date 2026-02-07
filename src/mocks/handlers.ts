import { http, HttpResponse, delay } from 'msw'
import { Ticket, CreateTicketData } from '../types/ticket'
import { v4 as uuidv4 } from 'uuid'

// In-memory ticket storage
let tickets: Ticket[] = [
  {
    id: 'ticket-1',
    title: 'Cannot login to account',
    description: 'User reports being unable to login after password reset. Error message shows invalid credentials.',
    priority: 'VIP',
    status: 'Open',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    assignee: null,
  },
  {
    id: 'ticket-2',
    title: 'Payment processing failed',
    description: 'Customer attempted to make a purchase but payment was declined despite valid card details.',
    priority: 'Regular',
    status: 'Open',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    assignee: null,
  },
  {
    id: 'ticket-3',
    title: 'Account upgrade request',
    description: 'VIP customer requesting immediate account upgrade to premium tier with additional features.',
    priority: 'VIP',
    status: 'Open',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    assignee: null,
  },
]

// Random delay between 300-800ms
const getRandomDelay = () => Math.floor(Math.random() * 500) + 300

// 10% failure rate for assignment operations
const shouldFail = () => Math.random() < 0.1

export const handlers = [
  // GET /tickets - Retrieve all tickets
  http.get('/tickets', async () => {
    await delay(getRandomDelay())
    return HttpResponse.json({ tickets })
  }),

  // POST /tickets - Create a new ticket
  http.post('/tickets', async ({ request }) => {
    await delay(getRandomDelay())
    const body = (await request.json()) as CreateTicketData

    const newTicket: Ticket = {
      id: uuidv4(),
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: 'Open',
      createdAt: new Date().toISOString(),
      assignee: null,
    }

    tickets.push(newTicket)
    return HttpResponse.json(newTicket, { status: 201 })
  }),

  // POST /tickets/:id/assign - Assign a ticket to an agent
  http.post('/tickets/:id/assign', async ({ params, request }) => {
    await delay(getRandomDelay())

    // 10% failure rate
    if (shouldFail()) {
      return HttpResponse.json(
        { error: 'Assignment failed. Please try again.' },
        { status: 500 }
      )
    }

    const { id } = params
    const body = (await request.json()) as { assignee: string }

    const ticketIndex = tickets.findIndex((t) => t.id === id)
    if (ticketIndex === -1) {
      return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      status: 'Assigned',
      assignee: body.assignee,
    }

    return HttpResponse.json({
      id: tickets[ticketIndex].id,
      status: tickets[ticketIndex].status,
      assignee: tickets[ticketIndex].assignee,
    })
  }),

  // POST /tickets/:id/resolve - Resolve an assigned ticket
  http.post('/tickets/:id/resolve', async ({ params }) => {
    await delay(getRandomDelay())

    const { id } = params
    const ticketIndex = tickets.findIndex((t) => t.id === id)

    if (ticketIndex === -1) {
      return HttpResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      status: 'Resolved',
    }

    return HttpResponse.json({
      id: tickets[ticketIndex].id,
      status: tickets[ticketIndex].status,
    })
  }),
]
