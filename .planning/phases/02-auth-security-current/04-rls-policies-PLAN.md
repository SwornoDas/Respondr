---
title: Row Level Security (RLS)
wave: 2
depends_on:
  - 01-auth-schema-PLAN.md
files_modified:
  - supabase/schema.sql
autonomous: true
---

# Plan: Row Level Security (RLS)

Secure the database tables so that only authorized users can modify incidents and staff status.

## Tasks

<task>
<read_first>
- supabase/schema.sql
</read_first>
<action>
Enable RLS on `incidents`, `staff_status`, and `profiles` tables.
Define policies:
- `incidents`: Public can INSERT, Authenticated can SELECT/UPDATE.
- `staff_status`: Authenticated can SELECT, Staff can UPDATE their own record.
- `profiles`: Authenticated can SELECT their own profile.
</action>
<acceptance_criteria>
- `supabase/schema.sql` contains `ENABLE ROW LEVEL SECURITY`.
- Appropriate `CREATE POLICY` statements are present for all tables.
</acceptance_criteria>
</task>

## Verification

### Automated
- `grep "POLICY" supabase/schema.sql` returns matches.

### Manual
- Attempt to fetch incidents anonymously (outside of the public SOS form) and verify it fails (once applied to Supabase).

## Must Haves
- Public SOS submission remains functional.
- Operational data protected from unauthorized access.
