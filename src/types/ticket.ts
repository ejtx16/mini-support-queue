export type Priority = 'VIP' | 'Regular';
export type TicketStatus = 'Open' | 'Assigned' | 'Resolved';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  createdAt: string;
  assignee: string | null;
}

export interface CreateTicketData {
  title: string;
  description: string;
  priority: Priority;
}

export interface TicketFormErrors {
  title?: string;
  description?: string;
  priority?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
