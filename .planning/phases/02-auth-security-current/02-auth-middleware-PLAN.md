---
title: Auth Middleware Protection
wave: 1
files_modified:
  - src/middleware.ts
autonomous: true
---

# Plan: Auth Middleware Protection

Implement route protection for `/admin` and `/staff` using Supabase Auth and Next.js Middleware.

## Tasks

<task>
<read_first>
- src/lib/supabase.ts
</read_first>
<action>
Create `src/middleware.ts` to check for an active Supabase session.
Protect paths: `/admin/:path*`, `/staff/:path*`.
Redirect unauthenticated users to `/login`.
</action>
<acceptance_criteria>
- `middleware.ts` exists in `src/`.
- Accessing `/admin` without a session redirects to `/login`.
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.

### Manual
- Try to access `/admin` while logged out and verify redirection to `/login`.

## Must Haves
- Secure redirection logic.
- Exclusion of public routes (/sos, /).
