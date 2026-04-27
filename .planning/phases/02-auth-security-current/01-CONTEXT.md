---
phase: 02-auth-security-current
locked_decisions:
  - Auth Provider: Supabase Auth (Email/Password).
  - Target Audience: Staff and Admin only. Guests/Public users are anonymous and do not require login.
  - Onboarding: No public signup form. Users are created/managed via Supabase/Admin panel.
  - Role Management: Simple 'role' column in `profiles` table to distinguish between Staff and Admin.
  - Route Protection: Next.js Middleware will protect `/admin` and `/staff` routes.
  - Redirect Strategy: Unauthenticated attempts to access protected routes will redirect to `/login`.
---

# Phase 2 Context: Auth & Security

This phase focuses on securing the operational dashboards (`/admin` and `/staff`) while maintaining a frictionless experience for guests submitting SOS alerts.

## Architectural Decisions

### 1. Identity & Profiles
- We will use a `profiles` table in the `public` schema that mirrors `auth.users`.
- Fields: `id` (UUID, PK, FK to auth.users), `email`, `full_name`, `role` (enum: 'staff', 'admin').
- A Postgres trigger will automatically create a profile record when a new user is added to Supabase Auth.

### 2. Route Protection (Next.js Middleware)
- **Public Routes**: `/`, `/sos`, `/login` (and assets).
- **Protected Routes**: `/admin/*`, `/staff/*`.
- **Logic**: If no active Supabase session is found for protected routes, redirect to `/login`.

### 3. Login Experience
- A sleek, premium login page at `/login` using the project's glassmorphism aesthetic.
- Standard Email/Password login.

### 4. Row Level Security (RLS)
- **Incidents Table**: 
    - `SELECT`: Authenticated users only.
    - `INSERT`: Anyone (public) can submit an SOS.
    - `UPDATE`: Authenticated users only.
- **Staff Status Table**:
    - `SELECT`: Authenticated users only.
    - `UPDATE`: Authenticated users only (staff updating their own status).

## User Preferences
- No public signup.
- Redirection to login for unauthorized access.
- Minimalistic role system.
