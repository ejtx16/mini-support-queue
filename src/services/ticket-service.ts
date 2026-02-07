import { Ticket, CreateTicketData } from '../types/ticket'

const API_BASE = ''

export async function getTickets(): Promise<Ticket[]> {
  const response = await fetch(`${API_BASE}/tickets`)
  if (!response.ok) {
    throw new Error('Failed to fetch tickets')
  }
  const data = await response.json()
  return data.tickets
}

export async function createTicket(ticketData: CreateTicketData): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketData),
  })
  if (!response.ok) {
    throw new Error('Failed to create ticket')
  }
  return response.json()
}

export async function assignTicket(
  ticketId: string,
  assignee: string
): Promise<{ id: string; status: string; assignee: string }> {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ assignee }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to assign ticket')
  }
  
  return data
}

export async function resolveTicket(
  ticketId: string
): Promise<{ id: string; status: string }> {
  const response = await fetch(`${API_BASE}/tickets/${ticketId}/resolve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error('Failed to resolve ticket')
  }
  
  return response.json()
}
