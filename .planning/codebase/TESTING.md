# Testing Strategy

## Current Status
- **No automated tests found**: The codebase currently lacks a `test/` directory or `*.test.ts` files.
- **Linting**: ESLint is configured for code quality checks.

## Future Recommendations
1. **Unit Testing**: Implement Vitest for testing utility functions and server-side logic in `src/features/`.
2. **Component Testing**: Use React Testing Library for verifying UI components.
3. **E2E Testing**: Implement Playwright for critical flows (SOS trigger -> Admin receipt).
4. **Integration Testing**: Test API endpoints using Supertest or similar.
