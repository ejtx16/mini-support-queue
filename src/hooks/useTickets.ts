import { useReducer, useCallback } from "react";
import { Ticket, CreateTicketData, TicketStatus } from "../types/ticket";
import * as ticketService from "../services/ticket-service";

const AGENT_ID = "agent-1";

interface TicketState {
  tickets: Ticket[];
  fetchLoading: boolean;
  createLoading: boolean;
  actionTicketId: string | null; // tracks which ticket is being assigned/resolved
  error: string | null;
  filter: TicketStatus | "All";
}

type TicketAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Ticket[] }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "CREATE_START" }
  | { type: "CREATE_SUCCESS"; payload: Ticket }
  | { type: "CREATE_ERROR"; payload: string }
  | { type: "ACTION_START"; payload: string }
  | { type: "ACTION_END" }
  | { type: "ASSIGN_SUCCESS"; payload: { id: string; assignee: string } }
  | { type: "RESOLVE_SUCCESS"; payload: { id: string } }
  | { type: "SET_FILTER"; payload: TicketStatus | "All" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_ERROR"; payload: string };

const initialState: TicketState = {
  tickets: [],
  fetchLoading: false,
  createLoading: false,
  actionTicketId: null,
  error: null,
  filter: "All",
};

function ticketReducer(state: TicketState, action: TicketAction): TicketState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, fetchLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, fetchLoading: false, tickets: action.payload };
    case "FETCH_ERROR":
      return { ...state, fetchLoading: false, error: action.payload };
    case "CREATE_START":
      return { ...state, createLoading: true, error: null };
    case "CREATE_SUCCESS":
      return { ...state, createLoading: false, tickets: [...state.tickets, action.payload] };
    case "CREATE_ERROR":
      return { ...state, createLoading: false, error: action.payload };
    case "ACTION_START":
      return { ...state, actionTicketId: action.payload, error: null };
    case "ACTION_END":
      return { ...state, actionTicketId: null };
    case "ASSIGN_SUCCESS":
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id ? { ...t, status: "Assigned" as const, assignee: action.payload.assignee } : t,
        ),
      };
    case "RESOLVE_SUCCESS":
      return {
        ...state,
        tickets: state.tickets.map((t) => (t.id === action.payload.id ? { ...t, status: "Resolved" as const } : t)),
      };
    case "SET_FILTER":
      return { ...state, filter: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Sort tickets: VIP first, then FIFO within each priority group
function sortTickets(tickets: Ticket[]): Ticket[] {
  return [...tickets].sort((a, b) => {
    // VIP tickets come first
    if (a.priority === "VIP" && b.priority !== "VIP") return -1;
    if (a.priority !== "VIP" && b.priority === "VIP") return 1;
    // Within same priority, sort by createdAt (oldest first - FIFO)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

// Get next eligible ticket for assignment (first Open ticket in sorted order)
function getNextEligibleTicket(tickets: Ticket[]): Ticket | null {
  const sorted = sortTickets(tickets);
  return sorted.find((t) => t.status === "Open") || null;
}

export function useTickets() {
  const [state, dispatch] = useReducer(ticketReducer, initialState);

  const fetchTickets = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const tickets = await ticketService.getTickets();
      dispatch({ type: "FETCH_SUCCESS", payload: tickets });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err.message : "Failed to fetch tickets",
      });
    }
  }, []);

  const createTicket = useCallback(async (data: CreateTicketData) => {
    dispatch({ type: "CREATE_START" });
    try {
      const ticket = await ticketService.createTicket(data);
      dispatch({ type: "CREATE_SUCCESS", payload: ticket });
      return true;
    } catch (err) {
      dispatch({
        type: "CREATE_ERROR",
        payload: err instanceof Error ? err.message : "Failed to create ticket",
      });
      return false;
    }
  }, []);

  const assignTicket = useCallback(async (ticketId: string) => {
    dispatch({ type: "ACTION_START", payload: ticketId });
    try {
      await ticketService.assignTicket(ticketId, AGENT_ID);
      dispatch({ type: "ASSIGN_SUCCESS", payload: { id: ticketId, assignee: AGENT_ID } });
      return true;
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Assignment failed. Please try again.",
      });
      return false;
    } finally {
      dispatch({ type: "ACTION_END" });
    }
  }, []);

  const assignNextTicket = useCallback(async () => {
    const nextTicket = getNextEligibleTicket(state.tickets);
    if (!nextTicket) {
      dispatch({ type: "SET_ERROR", payload: "No open tickets available to assign." });
      return false;
    }
    return assignTicket(nextTicket.id);
  }, [state.tickets, assignTicket]);

  const resolveTicket = useCallback(async (ticketId: string) => {
    dispatch({ type: "ACTION_START", payload: ticketId });
    try {
      await ticketService.resolveTicket(ticketId);
      dispatch({ type: "RESOLVE_SUCCESS", payload: { id: ticketId } });
      return true;
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: err instanceof Error ? err.message : "Failed to resolve ticket",
      });
      return false;
    } finally {
      dispatch({ type: "ACTION_END" });
    }
  }, []);

  const setFilter = useCallback((filter: TicketStatus | "All") => {
    dispatch({ type: "SET_FILTER", payload: filter });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Get filtered and sorted tickets
  const filteredTickets = sortTickets(state.filter === "All" ? state.tickets : state.tickets.filter((t) => t.status === state.filter));

  // Check if there are open tickets available for assignment
  const hasOpenTickets = state.tickets.some((t) => t.status === "Open");

  return {
    tickets: filteredTickets,
    allTickets: state.tickets,
    fetchLoading: state.fetchLoading,
    createLoading: state.createLoading,
    actionTicketId: state.actionTicketId,
    error: state.error,
    filter: state.filter,
    hasOpenTickets,
    fetchTickets,
    createTicket,
    assignTicket,
    assignNextTicket,
    resolveTicket,
    setFilter,
    clearError,
  };
}

export { sortTickets, getNextEligibleTicket };
