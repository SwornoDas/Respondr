---
title: Setup Supabase Foundation
wave: 1
files_modified:
  - .env.local
  - src/lib/supabase.ts
autonomous: true
---

# Plan: Setup Supabase Foundation

This plan initializes the Supabase client and configures the environment variables required for connection.

## Tasks

<task>
<read_first>
- package.json
</read_first>
<action>
Install `@supabase/supabase-js` and create the Supabase client initialization file.
</action>
<acceptance_criteria>
- `package.json` contains `@supabase/supabase-js`.
- `src/lib/supabase.ts` exists and exports a `supabase` client initialized with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
</acceptance_criteria>
</task>

<task>
<read_first>
- .gitignore
</read_first>
<action>
Create/update `.env.local` with placeholder values for Supabase.
</action>
<acceptance_criteria>
- `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.
- `grep "createClient" src/lib/supabase.ts` returns a match.

### Manual
- None.

## Must Haves
- Working Supabase client export.
- Environment variables configured for development.
