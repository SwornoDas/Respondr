# Respondr

Respondr is a rapid crisis response and coordination platform for hospitality teams.
It is designed to reduce the time between a guest distress signal and a responder action
by combining fast intake, shared incident state, escalation-ready workflows, and
operator-focused dashboards.

## Product surfaces

- `Guest SOS`: a low-friction emergency form for guests to report medical, fire, or security incidents.
- `Admin dashboard`: a command view for triage, acknowledgement, and resolution.
- `Staff board`: a responder-first task queue for mobile-friendly incident handling.

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up environment variables**:
    - Copy the example environment file:
      ```bash
      cp .env.example .env.local
      ```
    - Update the values in `.env.local` with your Supabase credentials.
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Current architecture

This repository is now structured as a single Next.js 16 application using the App Router.
Instead of splitting the codebase into a separate frontend and Express backend too early,
the app uses the backend-for-frontend pattern:

- `app` routes handle guest, admin, and staff experiences.
- `app/api` route handlers expose incident and staff endpoints.
- `features/incidents` owns the emergency-response domain.
- `supabase/schema.sql` remains the durable database contract for the future persistent layer.

This keeps the project simple right now while still leaving clean seams for:

- Supabase persistence and auth
- websocket or realtime event delivery
- Twilio voice and SMS escalation
- AI-assisted incident classification

## Repository structure

```text
Respondr/
|-- public/
|-- src/
|   |-- app/
|   |   |-- (operations)/
|   |   |   |-- admin/
|   |   |   |   `-- page.tsx
|   |   |   |-- sos/
|   |   |   |   `-- page.tsx
|   |   |   |-- staff/
|   |   |   |   `-- page.tsx
|   |   |   `-- layout.tsx
|   |   |-- api/
|   |   |   |-- incidents/
|   |   |   |   |-- [id]/
|   |   |   |   |   `-- status/route.ts
|   |   |   |   `-- route.ts
|   |   |   `-- staff/
|   |   |       `-- online/route.ts
|   |   |-- globals.css
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |   `-- section-card.tsx
|   |-- features/
|   |   `-- incidents/
|   |       |-- components/
|   |       |   |-- admin-dashboard.tsx
|   |       |   |-- guest-sos-form.tsx
|   |       |   `-- staff-board.tsx
|   |       |-- hooks/
|   |       |   `-- use-incident-stream.ts
|   |       |-- server/
|   |       |   `-- store.ts
|   |       |-- constants.ts
|   |       |-- mock-data.ts
|   |       |-- types.ts
|   |       `-- utils.ts
|   `-- lib/
|       `-- navigation.ts
|-- supabase/
|   `-- schema.sql
|-- AGENTS.md
|-- package.json
`-- README.md
```

## Why this structure

### 1. Route ownership is obvious

The public entry points live in `src/app`, which makes it easy to see:

- what users can visit
- what API endpoints exist
- which layouts wrap which sections

### 2. Domain logic is not buried inside pages

The incident domain is grouped in `src/features/incidents`, so types, mock data,
hooks, client components, and server helpers evolve together.

### 3. Server code has a clean upgrade path

`src/features/incidents/server/store.ts` is currently an in-memory store so the
UI can work end-to-end. Later this can be replaced with Supabase-backed services
without changing the page structure.

### 4. Shared UI stays lightweight

Reusable presentational pieces live in `src/components`, while cross-cutting app
configuration stays in `src/lib`.

## Request flow

1. A guest opens `/sos` and submits an emergency incident.
2. The form posts to `POST /api/incidents`.
3. The route handler validates input and writes to the incident service layer.
4. Admins view the incident queue at `/admin`.
5. Responders work the task queue at `/staff`.
6. Status updates flow through `PATCH /api/incidents/[id]/status`.

## Current status

Working now:

- product routes for guest, admin, and staff
- shared incident types and mock data
- internal incident and staff API routes
- realtime-ready client hook for socket events
- Supabase schema file for the future persistent model

Still to wire up:

- Supabase database reads and writes
- Supabase Auth for role-based access
- websocket backend or hosted realtime provider
- Twilio escalation logic
- AI classification and prioritization services

## Environment variables

The project uses the following environment variables. You can find a template in `.env.example`.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Socket.io (Future)
NEXT_PUBLIC_SOCKET_URL=

# Twilio (Future)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

## Suggested next steps

1. Replace the in-memory incident store with Supabase reads and writes.
2. Protect `/admin` and `/staff` using Supabase Auth and role checks.
3. Add realtime delivery for `new_incident` and `incident_updated`.
4. Move escalation timers and Twilio actions into dedicated server services.
5. Add audit logs and incident history before going multi-tenant.
