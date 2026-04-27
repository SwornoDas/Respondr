# Architecture

## System Overview
Respondr is an emergency response platform designed for high-availability crisis communication. It uses a modern full-stack architecture with a focus on real-time updates and modular feature isolation.

## Key Patterns

### 1. Feature-Based Organization
The codebase follows a feature-centric structure under `src/features/`. Each feature (e.g., `incidents`) encapsulates its own components, hooks, utils, and server-side logic.

### 2. Real-Time Streaming
The platform relies on `socket.io` for real-time incident updates. This ensures that admin and staff dashboards are updated immediately without manual refreshing.

### 3. Server-Side State Management
An in-memory store is currently used (`src/features/incidents/server/store.ts`) for incident tracking, likely as a bridge towards a persistent database solution like Supabase.

### 4. Next.js App Router & Route Groups
The application uses Next.js route groups (e.g., `(operations)`) to organize different user contexts (Admin, Staff, SOS/Guest) while maintaining a clean URL structure.

## Data Flow
1. **SOS Trigger**: Guest submits an SOS form via `src/app/(operations)/sos/page.tsx`.
2. **API Processing**: The `src/app/api/incidents/route.ts` handles the request and updates the server-side store.
3. **Broadcasting**: Socket.io emits the new incident event.
4. **Dashboard Update**: `use-incident-stream` hook in Admin/Staff dashboards receives the event and updates the UI.
