# Mini Support Queue - Product Requirements Document (PRD)

## 1. Project Overview

### 1.1 Purpose
Build a small React application that enables support agents to manage a ticket queue efficiently. The application provides functionality for creating, viewing, assigning, and resolving support tickets.

### 1.2 Target Users
- Support agents who need to manage incoming support tickets
- Hardcoded agent identifier: `agent-1`

### 1.3 Technology Stack
- **Frontend**: React (TypeScript optional but recommended)
- **Mock API**: MSW (Mock Service Worker) or in-memory service layer
- **State Management**: React state (useState/useReducer) or state management library

---

## 2. Data Model

### 2.1 Ticket Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the ticket |
| `title` | string | Title of the ticket (5-80 characters) |
| `description` | string | Detailed description (20-500 characters) |
| `priority` | enum | `VIP` \| `Regular` |
| `status` | enum | `Open` \| `Assigned` \| `Resolved` |
| `createdAt` | Date/timestamp | When the ticket was created |
| `assignee` | string \| null | Agent ID assigned to the ticket (null if unassigned) |

### 2.2 TypeScript Interface

```typescript
interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'VIP' | 'Regular';
  status: 'Open' | 'Assigned' | 'Resolved';
  createdAt: Date;
  assignee: string | null;
}
```

---

## 3. Functional Requirements

### FR-1: Create Ticket Form

**Description**: A form that allows users to create new support tickets.

**Requirements**:
- **Title Field**
  - Required
  - Minimum: 5 characters
  - Maximum: 80 characters
  - Show inline validation error if invalid

- **Description Field**
  - Required
  - Minimum: 20 characters
  - Maximum: 500 characters
  - Show inline validation error if invalid

- **Priority Selector**
  - Options: `VIP` or `Regular`
  - Required selection

**Behavior**:
- On submit, validate all fields
- Display inline validation errors for invalid fields
- If valid, add ticket to queue with:
  - Auto-generated unique `id`
  - `status` set to `Open`
  - `createdAt` set to current timestamp
  - `assignee` set to `null`
- Clear form after successful submission

---

### FR-2: Queue List (Agent View)

**Description**: Display a list/table of all tickets with filtering and proper ordering.

**Display Columns**:
- Title
- Priority (VIP/Regular)
- Status (Open/Assigned/Resolved)
- Created time

**Filtering**:
- Filter dropdown/tabs by status:
  - All
  - Open
  - Assigned
  - Resolved

**Queue Ordering** (Critical):
1. VIP tickets appear first
2. Regular tickets appear after VIP
3. Within each priority group, order by FIFO (First In, First Out - oldest first)

**Example Order**:
```
1. VIP Ticket (created 10:00 AM)
2. VIP Ticket (created 10:15 AM)
3. VIP Ticket (created 10:30 AM)
4. Regular Ticket (created 9:00 AM)
5. Regular Ticket (created 9:30 AM)
6. Regular Ticket (created 11:00 AM)
```

---

### FR-3: Assignment Actions

**Description**: Allow agents to assign tickets to themselves.

**Action 1: Assign Next**
- Global button (not per-ticket)
- Assigns the next eligible ticket to the current agent (`agent-1`)
- "Next eligible" = first Open ticket respecting queue ordering (VIP first, then FIFO)
- Changes ticket status from `Open` to `Assigned`
- Sets `assignee` to `agent-1`

**Action 2: Assign Specific**
- Per-ticket "Assign to me" button
- Only visible/enabled for tickets with `status: Open`
- Assigns that specific ticket to `agent-1`
- Changes ticket status from `Open` to `Assigned`
- Sets `assignee` to `agent-1`

---

### FR-4: Resolve Tickets

**Description**: Allow agents to mark assigned tickets as resolved.

**Requirements**:
- "Resolve" button per ticket
- Only visible/enabled for tickets with `status: Assigned`
- Changes ticket status from `Assigned` to `Resolved`
- Keeps `assignee` value unchanged

---

### FR-5: Backend Simulation

**Description**: Simulate backend behavior with latency and failures.

**Option A: MSW Mock API**
- Intercept HTTP requests
- Return mock responses

**Option B: In-Memory Service Layer**
- Functions that return Promises
- Simulate async behavior

**Simulated Latency**:
- All API calls should have random delay between 300-800ms
- Show loading states during this delay

**Simulated Failures**:
- Assignment operations (Assign Next, Assign Specific) have 10% chance of failure
- On failure, display error banner or toast notification
- Allow user to retry the operation

---

## 4. Non-Functional Requirements

### NFR-1: Loading States
- Show loading indicator during API calls
- Disable relevant buttons during loading
- Prevent duplicate submissions

### NFR-2: Empty States
- Display appropriate message when no tickets exist
- Display message when filter returns no results

### NFR-3: Error States
- Display user-friendly error messages
- Show error banner/toast for failed operations
- Provide retry mechanism where appropriate

### NFR-4: Code Quality
- Clean component structure
- Separation of concerns (UI vs business logic)
- Reasonable API/service abstraction
- Consistent code style

### NFR-5: User Experience
- Responsive feedback for all actions
- Clear visual distinction between ticket priorities
- Intuitive navigation and controls

---

## 5. API Specification

### 5.1 Endpoints

#### GET /tickets
Retrieve all tickets.

**Response**:
```json
{
  "tickets": [
    {
      "id": "ticket-1",
      "title": "Cannot login to account",
      "description": "User reports being unable to login...",
      "priority": "VIP",
      "status": "Open",
      "createdAt": "2024-01-15T10:30:00Z",
      "assignee": null
    }
  ]
}
```

#### POST /tickets
Create a new ticket.

**Request Body**:
```json
{
  "title": "New ticket title",
  "description": "Detailed description of the issue...",
  "priority": "VIP"
}
```

**Response**:
```json
{
  "id": "ticket-123",
  "title": "New ticket title",
  "description": "Detailed description of the issue...",
  "priority": "VIP",
  "status": "Open",
  "createdAt": "2024-01-15T10:30:00Z",
  "assignee": null
}
```

#### POST /tickets/:id/assign
Assign a ticket to an agent.

**Request Body**:
```json
{
  "assignee": "agent-1"
}
```

**Response (Success)**:
```json
{
  "id": "ticket-123",
  "status": "Assigned",
  "assignee": "agent-1"
}
```

**Response (Failure - 10% chance)**:
```json
{
  "error": "Assignment failed. Please try again."
}
```

#### POST /tickets/:id/resolve
Resolve an assigned ticket.

**Response**:
```json
{
  "id": "ticket-123",
  "status": "Resolved"
}
```

---

## 6. Testing Requirements

### 6.1 Required Tests (Minimum 1-2)

**Test 1: Queue Ordering**
- Verify VIP tickets appear before Regular tickets
- Verify FIFO ordering within each priority group
- Test with mixed priorities and creation times

**Test 2: Assign Next Logic**
- Verify "Assign Next" selects the correct ticket
- Should select first VIP Open ticket
- If no VIP Open tickets, select first Regular Open ticket
- Verify status changes to Assigned
- Verify assignee is set correctly

### 6.2 Suggested Additional Tests
- Form validation (title length, description length)
- Filter functionality
- Resolve action updates status correctly
- Error handling for failed assignments

---

## 7. Deliverables

### 7.1 GitHub Repository
- Complete source code
- Organized folder structure
- Clean commit history

### 7.2 README.md
- Project setup instructions
- How to run the application
- How to run tests
- Assumptions made during development
- Any known limitations

---

## 8. Evaluation Criteria

The application will be evaluated on:

1. **Correct Ordering**: VIP-first, FIFO within groups
2. **State Updates**: Proper state management for all operations
3. **Component Structure**: Clean, reusable components
4. **UX for Errors/Loading**: Appropriate feedback for all states
5. **API/Service Abstraction**: Reasonable separation of concerns

---

## 9. Time Estimate

Expected completion time: **2-3 hours**

---

## Appendix A: User Flow Diagrams

### A.1 Create Ticket Flow
```
User fills form → Validates input → Submit → API call → 
→ Success: Add to queue, clear form
→ Failure: Show error, keep form data
```

### A.2 Assign Ticket Flow
```
User clicks "Assign" → API call with loading state →
→ Success (90%): Update ticket status and assignee
→ Failure (10%): Show error toast, allow retry
```

### A.3 Resolve Ticket Flow
```
User clicks "Resolve" → API call → Update status to Resolved
```
