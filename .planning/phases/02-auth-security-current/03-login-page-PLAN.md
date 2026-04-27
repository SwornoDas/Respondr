---
title: Premium Login UI
wave: 2
depends_on:
  - 02-auth-middleware-PLAN.md
files_modified:
  - src/app/login/page.tsx
autonomous: true
---

# Plan: Premium Login UI

Create a visually stunning login page for staff and admins.

## Tasks

<task>
<read_first>
- src/app/layout.tsx
</read_first>
<action>
Create `src/app/login/page.tsx` with a premium glassmorphism design.
Implement `signInWithPassword` logic using the Supabase client.
Handle error states (invalid credentials) with clear feedback.
</action>
<acceptance_criteria>
- `/login` route is accessible.
- Form includes Email and Password inputs.
- Successful login redirects to either `/admin` or `/staff`.
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.

### Manual
- Log in with test credentials and verify redirection.

## Must Haves
- Project-consistent aesthetics.
- Error handling for failed logins.
