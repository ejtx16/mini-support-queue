import { describe, it, expect } from 'vitest'
import { sortTickets, getNextEligibleTicket } from '../hooks/useTickets'
import { Ticket } from '../types/ticket'

// Helper to create test tickets
function createTicket(
  overrides: Partial<Ticket> & { id: string; createdAt: string }
): Ticket {
  return {
    title: 'Test Ticket',
    description: 'Test description for the ticket',
    priority: 'Regular',
    status: 'Open',
    assignee: null,
    ...overrides,
  }
}

describe('Queue Ordering', () => {
  it('should sort VIP tickets before Regular tickets', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'Regular',
        createdAt: '2024-01-15T09:00:00Z',
      }),
      createTicket({
        id: '2',
        priority: 'VIP',
        createdAt: '2024-01-15T10:00:00Z',
      }),
      createTicket({
        id: '3',
        priority: 'Regular',
        createdAt: '2024-01-15T08:00:00Z',
      }),
    ]

    const sorted = sortTickets(tickets)

    // VIP ticket should be first
    expect(sorted[0].id).toBe('2')
    expect(sorted[0].priority).toBe('VIP')

    // Regular tickets should follow
    expect(sorted[1].priority).toBe('Regular')
    expect(sorted[2].priority).toBe('Regular')
  })

  it('should sort tickets by FIFO within same priority (oldest first)', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'VIP',
        createdAt: '2024-01-15T10:30:00Z',
      }),
      createTicket({
        id: '2',
        priority: 'VIP',
        createdAt: '2024-01-15T10:00:00Z',
      }),
      createTicket({
        id: '3',
        priority: 'VIP',
        createdAt: '2024-01-15T10:15:00Z',
      }),
    ]

    const sorted = sortTickets(tickets)

    // Should be ordered by createdAt (oldest first)
    expect(sorted[0].id).toBe('2') // 10:00
    expect(sorted[1].id).toBe('3') // 10:15
    expect(sorted[2].id).toBe('1') // 10:30
  })

  it('should correctly order mixed priority tickets with FIFO', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'VIP',
        createdAt: '2024-01-15T10:00:00Z',
      }),
      createTicket({
        id: '2',
        priority: 'Regular',
        createdAt: '2024-01-15T09:00:00Z',
      }),
      createTicket({
        id: '3',
        priority: 'VIP',
        createdAt: '2024-01-15T10:15:00Z',
      }),
      createTicket({
        id: '4',
        priority: 'Regular',
        createdAt: '2024-01-15T09:30:00Z',
      }),
      createTicket({
        id: '5',
        priority: 'VIP',
        createdAt: '2024-01-15T10:30:00Z',
      }),
      createTicket({
        id: '6',
        priority: 'Regular',
        createdAt: '2024-01-15T11:00:00Z',
      }),
    ]

    const sorted = sortTickets(tickets)

    // VIP tickets first (FIFO within VIP)
    expect(sorted[0].id).toBe('1') // VIP 10:00
    expect(sorted[1].id).toBe('3') // VIP 10:15
    expect(sorted[2].id).toBe('5') // VIP 10:30

    // Regular tickets after (FIFO within Regular)
    expect(sorted[3].id).toBe('2') // Regular 09:00
    expect(sorted[4].id).toBe('4') // Regular 09:30
    expect(sorted[5].id).toBe('6') // Regular 11:00
  })

  it('should handle empty ticket list', () => {
    const sorted = sortTickets([])
    expect(sorted).toEqual([])
  })

  it('should handle single ticket', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'Regular',
        createdAt: '2024-01-15T10:00:00Z',
      }),
    ]

    const sorted = sortTickets(tickets)
    expect(sorted.length).toBe(1)
    expect(sorted[0].id).toBe('1')
  })
})

describe('Assign Next Logic', () => {
  it('should select the first VIP Open ticket', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'Regular',
        status: 'Open',
        createdAt: '2024-01-15T09:00:00Z',
      }),
      createTicket({
        id: '2',
        priority: 'VIP',
        status: 'Open',
        createdAt: '2024-01-15T10:00:00Z',
      }),
      createTicket({
        id: '3',
        priority: 'VIP',
        status: 'Open',
        createdAt: '2024-01-15T10:30:00Z',
      }),
    ]

    const nextTicket = getNextEligibleTicket(tickets)

    expect(nextTicket).not.toBeNull()
    expect(nextTicket?.id).toBe('2') // First VIP by FIFO
    expect(nextTicket?.priority).toBe('VIP')
  })

  it('should select first Regular Open ticket if no VIP Open tickets', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'VIP',
        status: 'Assigned',
        createdAt: '2024-01-15T10:00:00Z',
      }),
      createTicket({
        id: '2',
        priority: 'Regular',
        status: 'Open',
        createdAt: '2024-01-15T09:30:00Z',
      }),
      createTicket({
        id: '3',
        priority: 'Regular',
        status: 'Open',
        createdAt: '2024-01-15T09:00:00Z',
      }),
    ]

    const nextTicket = getNextEligibleTicket(tickets)

    expect(nextTicket).not.toBeNull()
    expect(nextTicket?.id).toBe('3') // First Regular by FIFO
    expect(nextTicket?.priority).toBe('Regular')
  })

  it('should return null if no Open tickets exist', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'VIP',
        status: 'Assigned',
        createdAt: '2024-01-15T10:00:00Z',
      }),
      createTicket({
        id: '2',
        priority: 'Regular',
        status: 'Resolved',
        createdAt: '2024-01-15T09:00:00Z',
      }),
    ]

    const nextTicket = getNextEligibleTicket(tickets)
    expect(nextTicket).toBeNull()
  })

  it('should return null for empty ticket list', () => {
    const nextTicket = getNextEligibleTicket([])
    expect(nextTicket).toBeNull()
  })

  it('should skip Assigned and Resolved tickets', () => {
    const tickets: Ticket[] = [
      createTicket({
        id: '1',
        priority: 'VIP',
        status: 'Resolved',
        createdAt: '2024-01-15T08:00:00Z',
      }),
      createTicket({
        id: '2',
        priority: 'VIP',
        status: 'Assigned',
        createdAt: '2024-01-15T09:00:00Z',
      }),
      createTicket({
        id: '3',
        priority: 'VIP',
        status: 'Open',
        createdAt: '2024-01-15T10:00:00Z',
      }),
      createTicket({
        id: '4',
        priority: 'Regular',
        status: 'Open',
        createdAt: '2024-01-15T07:00:00Z',
      }),
    ]

    const nextTicket = getNextEligibleTicket(tickets)

    expect(nextTicket).not.toBeNull()
    expect(nextTicket?.id).toBe('3') // First Open VIP
    expect(nextTicket?.status).toBe('Open')
  })
})
