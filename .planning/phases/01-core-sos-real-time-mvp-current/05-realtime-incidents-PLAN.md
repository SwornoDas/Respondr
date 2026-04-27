---
title: Real-time Incident Streaming
wave: 3
depends_on:
  - 03-api-persistence-PLAN.md
files_modified:
  - src/features/incidents/hooks/use-incident-stream.ts
autonomous: true
---

# Plan: Real-time Incident Streaming

Implement live updates for incidents using Supabase Realtime subscriptions.

## Tasks

<task>
<read_first>
- src/features/incidents/hooks/use-incident-stream.ts
- src/lib/supabase.ts
</read_first>
<action>
Replace the existing socket logic in `use-incident-stream.ts` with Supabase `on('postgres_changes', ...)` subscription for the `incidents` table.
The hook should return the initial list of incidents and then listen for INSERT/UPDATE events.
</action>
<acceptance_criteria>
- Hook uses `supabase.channel(...)`.
- Hook updates its internal state when a new incident is inserted or updated in Supabase.
- Initial data is fetched via `supabase.from('incidents').select('*')`.
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.

### Manual
- Open `/admin` in one tab and `/sos` in another. Trigger an SOS and verify the admin dashboard updates immediately without refresh.

## Must Haves
- Instant UI updates for new incidents.
- Sync state between database and dashboard.
