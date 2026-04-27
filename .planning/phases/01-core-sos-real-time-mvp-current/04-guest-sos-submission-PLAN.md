---
title: Guest SOS Submission
wave: 2
depends_on:
  - 03-api-persistence-PLAN.md
files_modified:
  - src/features/incidents/components/guest-sos-form.tsx
autonomous: true
---

# Plan: Guest SOS Submission

Ensure the Guest SOS form correctly submits to the updated API and handles success/error states.

## Tasks

<task>
<read_first>
- src/features/incidents/components/guest-sos-form.tsx
</read_first>
<action>
Update the `onSubmit` handler in `guest-sos-form.tsx` to call `POST /api/incidents`. 
Ensure room number and type (Medical, Fire, Security) are passed.
</action>
<acceptance_criteria>
- Form submission triggers a fetch request to `/api/incidents`.
- Successful submission shows a confirmation message to the guest.
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.

### Manual
- Trigger an SOS from `/sos` and verify the "Success" state is displayed.

## Must Haves
- User-friendly SOS submission flow.
- Data correctly sent to the API.
