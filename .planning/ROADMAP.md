# Roadmap

## Phase 1: Core SOS & Dashboards (Completed)
- **Goal:** Enable guests to trigger emergencies and staff/admins to see them via mock dashboards.
- **Outcome:** Functional UI routes, in-memory store, and shared domain logic.

## Phase 2: Persistence & Auth (Current)
- **Goal:** Replace mock data with Supabase and secure the platform.
- **Plans:**
  1. Initialize Supabase project and apply `schema.sql`.
  2. Implement incident persistence (Read/Write to Supabase).
  3. Implement staff status tracking in DB.
  4. Integrate Supabase Auth for Admin and Staff users.
  5. Add route protection middleware.

## Phase 3: Real-time & Escalation
- **Goal:** Add live updates and external notification channels.
- **Plans:**
  1. Implement Supabase Realtime subscriptions for incidents.
  2. Integrate Twilio for SMS/Voice escalation.
  3. Implement auto-assignment and priority logic.
  4. Add AI-assisted classification.
