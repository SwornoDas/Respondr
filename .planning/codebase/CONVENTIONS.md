# Code Conventions

## Languages & Syntax
- **TypeScript**: Mandatory for all new code. Use strict typing where possible.
- **ESNext**: Use modern JavaScript features (ES2022+).

## Component Development
- **Functional Components**: Use React functional components with hooks.
- **Tailwind CSS**: Use utility classes for styling. Follow the "mobile-first" approach.
- **Lucide Icons**: Standardize on Lucide for all iconography.

## File Naming
- **kebab-case**: Use kebab-case for directories and non-component files (e.g., `use-incident-stream.ts`).
- **kebab-case**: Components are also using kebab-case in this project (e.g., `admin-dashboard.tsx`, `section-card.tsx`).

## API Design
- **RESTful Routes**: API routes follow REST conventions (e.g., `/api/incidents/[id]/status`).
- **JSON responses**: Always return structured JSON with consistent error handling.

## Directory structure
- **Feature Isolation**: Logic should reside in `src/features/[feature-name]` rather than global folders when specific to one domain.
