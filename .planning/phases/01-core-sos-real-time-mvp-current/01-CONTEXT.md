# Phase 1 Context: Core SOS & Real-time Integration

## Implementation Decisions

### 1. Real-time Communication
- **Decision**: Use **Supabase Realtime**.
- **Rationale**: Since Supabase is already the database of choice, using its built-in real-time features (Postgres Changes) simplifies the architecture and eliminates the need for a separate Socket.io server or external services like Pusher.
- **Action**: Implement Supabase subscriptions in `use-incident-stream.ts`.

### 2. State Persistence
- **Decision**: Initialize **Supabase Client** and replace the in-memory store immediately.
- **Rationale**: An emergency platform requires durable storage. Moving persistence into Phase 1 ensures the "MVP" is actually functional and resilient to server restarts.
- **Action**: Set up `src/lib/supabase.ts` and update `src/features/incidents/server/store.ts` (or create a service layer) to use the database.

### 3. Sound Alerts
- **Decision**: Trigger a **custom audio alert** in the Admin Dashboard.
- **Rationale**: Critical for ensuring immediate awareness in a hotel operations environment.
- **Action**: Add an `alert.mp3` to `public/` and play it on new incident events.

### 4. Staff Online Status
- **Decision**: Implement a basic heartbeat/status table in Supabase.
- **Rationale**: Admins need to know who is available to respond.
- **Action**: Create `staff_status` table and a toggle in the Staff Dashboard.

## Refined Scope for Phase 1
- **Guest SOS**: Submit to Supabase `incidents` table.
- **Admin Dashboard**: Real-time list of incidents (Supabase Realtime) with sound alerts.
- **Staff Board**: Real-time task queue and online/offline status toggle.
- **Backend**: Next.js route handlers acting as a thin layer over Supabase.

## Research Needed
- Optimal configuration for Supabase Realtime "Postgres Changes" filters.
- Browser audio play policies (handling "user must interact" requirements).
