# Mini Support Queue

A React TypeScript support ticket management application that enables support agents to manage a ticket queue efficiently.


## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **MSW (Mock Service Worker)** for API simulation
- **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ticketing-app
```

2. Install dependencies:
```bash
npm install
```

3. Initialize MSW service worker:
```bash
npx msw init public/ --save
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Running Tests

```bash
npm test
```

## Project Structure

```
src/
├── components/          # React components
│   ├── CreateTicketForm.tsx
│   ├── TicketList.tsx
│   ├── TicketCard.tsx
│   ├── StatusFilter.tsx
│   ├── Toast.tsx
│   └── LoadingSpinner.tsx
├── hooks/               # Custom React hooks
│   └── useTickets.ts
├── mocks/               # MSW mock handlers
│   ├── handlers.ts
│   └── browser.ts
├── services/            # API service layer
│   └── ticketService.ts
├── types/               # TypeScript types
│   └── ticket.ts
├── __tests__/           # Test files
│   └── ticketOrdering.test.ts
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |
