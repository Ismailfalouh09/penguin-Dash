# Deployment Guide

## Production Environment Variables

Set these values for production builds:

- `VITE_API_BASE_URL` - Absolute URL for the deployed backend API.
- `VITE_APP_NAME` - Display name used in the shell and browser chrome.
- `VITE_ENABLE_QUERY_DEVTOOLS` - Leave disabled in production.

All environment reads flow through `src/config/env.ts`.

## Build Command

```bash
npm run build
```

This produces the static client bundle in `dist/`.

## Static Hosting Requirements

- Serve the contents of `dist/` from a static host.
- Cache hashed assets aggressively.
- Do not cache `index.html` for long periods.
- Keep the client and API on separate origins unless the host provides both.

## API Base URL Configuration

- Point `VITE_API_BASE_URL` to the production backend origin.
- Do not hardcode localhost in production source code.
- All requests continue to flow through the generated client and `src/lib/api/http-client.ts`.

## Route Fallback Requirement

The app is a single-page application, so the host must rewrite unknown paths to `index.html`.

This is required for direct visits and refreshes on routes such as:

- `/orders/:orderId`
- `/products/:productId`
- `/recommendation-rules/:ruleId`

## Authentication and Session Behavior

- The access token is stored in `sessionStorage`.
- `AuthProvider` restores a session by calling `GET /auth/me`.
- A `401` tears down the session and returns the user to `/login`.
- Guest users remain on the login route, and authenticated users stay inside the protected shell.

## Security Notes

- The UI never sends raw credentials or secrets to the browser console.
- API access is centralized; components do not call `fetch` directly.
- Permission checks hide write actions in the UI, but the backend stays authoritative.
- No tracking scripts, fake analytics, or hardcoded production business numbers are included in the release.

## Known Backend Limitations

- No delivery-provider integration.
- No WhatsApp confirmation flow.
- No payment integration.
- No automatic stock deduction.
- No stock reservation.
- Dashboard statistics are limited to backend-backed counts; richer revenue and stock analytics are not exposed yet.

## Manual Production Check

The user manually checked Task 16A and reported the release-ready UI and accessibility pass as working.
