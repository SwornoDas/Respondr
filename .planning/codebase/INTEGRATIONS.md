# Integrations

## External Services

### 1. Twilio
- **Purpose**: Automated crisis communication (Voice/SMS).
- **Status**: Referenced in documentation and constants, but not yet fully integrated in `package.json` dependencies.
- **Keys Required**: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.

### 2. Supabase
- **Purpose**: Database and possibly Authentication.
- **Status**: Schema defined in `supabase/schema.sql`, but `supabase-js` is missing from `package.json`.
- **Infrastructure**: Expected to handle incident persistence and user management.

### 3. Socket.io
- **Purpose**: Real-time incident streaming.
- **Status**: `socket.io-client` installed. Likely used for the `use-incident-stream` hook in `src/features/incidents/hooks`.

### 4. Vercel
- **Purpose**: Hosting and CI/CD.
- **Status**: `vercel.josn` configured.
