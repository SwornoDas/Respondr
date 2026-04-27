---
title: Logout Integration
wave: 3
depends_on:
  - 03-login-page-PLAN.md
files_modified:
  - src/app/(operations)/admin/page.tsx
  - src/app/(operations)/staff/page.tsx
autonomous: true
---

# Plan: Logout Integration

Add logout functionality to the Admin and Staff dashboards.

## Tasks

<task>
<read_first>
- src/features/incidents/components/admin-dashboard.tsx
- src/features/incidents/components/staff-board.tsx
</read_first>
<action>
Add a Logout button to the dashboard headers.
Implement `supabase.auth.signOut()` logic.
Redirect to `/login` upon successful sign out.
</action>
<acceptance_criteria>
- Logout button is visible on Admin and Staff pages.
- Clicking logout ends the session and redirects to `/login`.
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.

### Manual
- Log in, click logout, and verify you can no longer access protected routes.

## Must Haves
- Working sign-out flow.
- UI consistency.
