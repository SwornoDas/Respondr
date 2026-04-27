---
title: API Persistence Layer
wave: 2
depends_on:
  - 02-refine-schema-PLAN.md
files_modified:
  - src/app/api/incidents/route.ts
  - src/app/api/incidents/[id]/status/route.ts
  - src/features/incidents/server/store.ts
autonomous: true
---

# Plan: API Persistence Layer

Replace the in-memory incident store with Supabase database queries.

## Tasks

<task>
<read_first>
- src/app/api/incidents/route.ts
- src/features/incidents/server/store.ts
- src/lib/supabase.ts
</read_first>
<action>
Modify `POST /api/incidents` to insert data into the `incidents` table using the Supabase client.
</action>
<acceptance_criteria>
- `route.ts` imports `supabase` from `@/lib/supabase`.
- `supabase.from('incidents').insert(...)` is used.
</acceptance_criteria>
</task>

<task>
<read_first>
- src/app/api/incidents/[id]/status/route.ts
</read_first>
<action>
Modify `PATCH /api/incidents/[id]/status` to update the incident status in Supabase.
</action>
<acceptance_criteria>
- `supabase.from('incidents').update(...).eq('id', id)` is used.
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.

### Manual
- Submit a test SOS and verify the record appears in the Supabase dashboard.

## Must Haves
- Incidents are saved to the database.
- Status updates are persisted.
