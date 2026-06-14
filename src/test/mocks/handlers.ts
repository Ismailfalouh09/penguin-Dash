import { HttpHandler } from 'msw'

// Handlers are populated in later tasks as features are implemented.
// MSW intercepts any unhandled requests during tests (configured with onUnhandledRequest: 'error').
export const handlers: HttpHandler[] = []
