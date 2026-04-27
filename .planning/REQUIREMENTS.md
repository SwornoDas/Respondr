# Requirements

## Validated

- [x] **SOS Emergency Trigger (PWA compatible)**
  - Emergency Button with Category Selection (Medical, Fire, Security)
  - Room number and optional description input
  - Emit real-time incident via API (in-memory)
- [x] **Basic Dashboards**
  - Admin view for triage
  - Staff view for task management
  - Shared incident types and constants

## Active

- [ ] **Supabase Integration (Persistence)**
  - Replace in-memory store with Supabase Postgres.
  - Implement CRUD operations for incidents and staff online status.
- [ ] **Role-Based Authentication**
  - Secure `/admin` and `/staff` routes using Supabase Auth.
  - Role checks for access control.
- [ ] **Real-time Event Delivery**
  - Implement live updates for new incidents and status changes.
  - Options: Supabase Realtime or Socket.io integration.
- [ ] **Twilio Escalation**
  - Voice and SMS alerts for high-priority incidents.
- [ ] **AI Classification**
  - Automated prioritization based on incident description.

## Out of Scope

- Staff payroll or shift management.
- Integration with hotel booking systems.
