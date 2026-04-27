---
title: Refine Database Schema
wave: 1
depends_on:
  - 01-setup-supabase-PLAN.md
files_modified:
  - supabase/schema.sql
autonomous: true
---

# Plan: Refine Database Schema

This plan updates the database schema to include the `staff_status` table and ensure all necessary enums are present for Respondr.

## Tasks

<task>
<read_first>
- supabase/schema.sql
</read_first>
<action>
Append the `staff_status` table definition to `supabase/schema.sql`. 
Table should include:
- `id` (UUID, PK)
- `email` (TEXT, unique)
- `name` (TEXT)
- `is_online` (BOOLEAN, default false)
- `last_seen` (TIMESTAMPTZ, default NOW())
</action>
<acceptance_criteria>
- `supabase/schema.sql` contains `CREATE TABLE public.staff_status`.
- Table has `is_online` and `last_seen` columns.
</acceptance_criteria>
</task>

## Verification

### Automated
- `grep "staff_status" supabase/schema.sql` returns a match.

### Manual
- Run the SQL in Supabase SQL Editor (handled by user or `supabase db push` if available).

## Must Haves
- Complete schema definition for incidents and staff status.
