# Project Structure

```text
Respondr/
├── .planning/               # GSD planning and codebase mapping
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (operations)/    # User-facing operational pages
│   │   │   ├── admin/       # Admin Dashboard
│   │   │   ├── staff/       # Staff Dashboard
│   │   │   └── sos/         # Guest SOS trigger page
│   │   ├── api/             # Backend API routes
│   │   │   ├── incidents/   # Incident management endpoints
│   │   │   └── staff/       # Staff status endpoints
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Landing page / entry point
│   ├── components/          # Shared UI components
│   ├── features/            # Business logic by feature
│   │   └── incidents/       # Incident management feature
│   │       ├── components/  # Feature-specific components
│   │       ├── hooks/       # Feature-specific hooks
│   │       ├── server/      # Server-side logic/store
│   │       └── constants.ts # Shared constants/types
│   ├── lib/                 # Shared utility libraries
│   └── styles/              # Global styles (Tailwind)
├── supabase/                # Database migrations and schema
└── package.json             # Project dependencies and scripts
```
