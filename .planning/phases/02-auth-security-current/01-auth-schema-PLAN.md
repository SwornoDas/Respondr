---
title: Auth Schema & Profiles
wave: 1
files_modified:
  - supabase/schema.sql
autonomous: true
---

# Plan: Auth Schema & Profiles

Setup the database structures required for user profiles and automated profile creation.

## Tasks

<task>
<read_first>
- supabase/schema.sql
</read_first>
<action>
Add the `profiles` table and a trigger to sync users from `auth.users`.
Fields: `id` (UUID, FK), `email` (TEXT), `full_name` (TEXT), `role` (TEXT, default 'staff').
Include the trigger function `handle_new_user()`.
</action>
<acceptance_criteria>
- `supabase/schema.sql` contains `CREATE TABLE public.profiles`.
- Trigger `on_auth_user_created` is defined.
</acceptance_criteria>
</task>

## Verification

### Automated
- `grep "profiles" supabase/schema.sql` returns a match.

### Manual
- Create a test user in Supabase Auth and verify a record appears in `public.profiles`.

## Must Haves
- Working profile synchronization trigger.
- Role-based profile structure.
