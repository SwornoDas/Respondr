---
title: Staff Status & Audio Alerts
wave: 3
depends_on:
  - 02-refine-schema-PLAN.md
  - 05-realtime-incidents-PLAN.md
files_modified:
  - src/app/(operations)/admin/page.tsx
  - src/app/(operations)/staff/page.tsx
  - src/app/api/staff/online/route.ts
autonomous: true
---

# Plan: Staff Status & Audio Alerts

Add audio notifications for admins and a real-time online status toggle for staff.

## Tasks

<task>
<read_first>
- src/app/(operations)/admin/page.tsx
</read_first>
<action>
Add a `useEffect` to play a notification sound when a new incident is received.
Add the `alert.mp3` file to `public/` (or use a placeholder/base64 for now).
</action>
<acceptance_criteria>
- Admin dashboard plays a sound on new incidents.
</acceptance_criteria>
</task>

<task>
<read_first>
- src/app/(operations)/staff/page.tsx
- src/app/api/staff/online/route.ts
</read_first>
<action>
Implement an "Online Status" toggle in the Staff Board.
Update the `is_online` status in the `staff_status` table via `api/staff/online`.
</action>
<acceptance_criteria>
- Staff board has a working toggle.
- Toggle updates the database record for the current staff member (use a mock email/ID for now).
</acceptance_criteria>
</task>

## Verification

### Automated
- `npm run lint` passes.

### Manual
- Admin hears a sound when an SOS is triggered.
- Staff toggles online and the change is reflected in the database.

## Must Haves
- Audible notification for critical events.
- Basic responder availability tracking.
