# Respondr

## What This Is

Respondr is a rapid crisis response and coordination platform for hospitality teams. It reduces the time between a guest distress signal and a responder action by combining fast intake, shared incident state, escalation-ready workflows, and operator-focused dashboards.

## Core Value

Ensure instant, reliable communication of hotel emergencies from guests to staff, minimizing response times and ensuring accountability.

## Requirements

### Validated

- [x] Product routes for guest, admin, and staff
- [x] Shared incident types and mock data
- [x] Internal incident and staff API routes
- [x] Realtime-ready client hook for socket events

### Active

- [ ] Supabase persistence for incidents and staff status
- [ ] Supabase Auth for role-based access (Admin, Staff)
- [ ] Real-time event delivery (Supabase Realtime or Socket.io)
- [ ] Twilio escalation logic (Voice/SMS)
- [ ] AI-assisted incident classification

### Out of Scope

- Staff payroll or shift management.
- Integration with hotel booking systems (unless needed for room validation).

## Context

Tech Stack:
- **Frontend/BFF**: Next.js 16 (App Router) + Tailwind CSS 4
- **Real-time**: Socket.io (client) / Supabase Realtime (planned)
- **Database**: Supabase (Postgres)
- **Integrations**: Twilio (Voice/SMS), Lucide React (Icons)

User Roles:
- **Guest**: Triggers SOS incidents.
- **Staff**: Responds to incidents via task queue.
- **Admin**: Triages and manages incidents.

## Constraints

- **Real-time**: Must maintain low latency for emergency alerts.
- **Security**: Admin and Staff dashboards must be protected by auth.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js App Router | Unified codebase (BFF pattern), simplifies deployment | Validated |
| Feature Isolation | `src/features/incidents` maintains domain boundaries | Validated |
| In-memory store | Used for initial MVP to validate UI/UX flow | Validated |
| Supabase | Chosen for persistent storage and future auth | Planned |

---
*Last updated: 2026-04-27*
