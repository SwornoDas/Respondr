# Codebase Concerns

## Technical Debt
- **Mock Implementation**: Many core features (Supabase, Twilio) are referenced but not fully implemented. The system currently relies on an in-memory store (`store.ts`) which will lose data on server restart.
- **Dependency Gaps**: `supabase-js` and `twilio` packages are missing from `package.json` despite being part of the architecture plan.

## Scalability
- **Socket.io on Serverless**: Running Socket.io on Vercel/Next.js API routes can be tricky due to the ephemeral nature of serverless functions. A dedicated WebSocket server or a service like Pusher/Ably may be needed for production scalability.

## Security
- **Authentication**: There is currently no visible authentication layer for the Admin and Staff dashboards.
- **Environment Variables**: Sensitive keys (Twilio, Supabase) are required but not yet validated in the codebase.

## Reliability
- **Error Handling**: Basic API routes are present, but robust error handling and retry logic for external services (Twilio) are yet to be implemented.
