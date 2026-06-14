# frontend-handoff

This directory contains the backend API contract package for the Penguin Beauty Admin dashboard.

**Do not modify these files.** They are the source of truth from the backend team.

## Contents

| File | Description |
|---|---|
| `openapi.json` | Full OpenAPI 3.0.0 spec — primary source of truth for all API calls |
| `openapi.yaml` | Same spec in YAML format |
| `FRONTEND_HANDOFF.md` | Integration guide and backend readiness notes |
| `PAGE_ENDPOINT_MAPPING.md` | Which API endpoints power each dashboard page |
| `ROLE_PERMISSION_MATRIX.md` | OWNER / ADMIN / STAFF permission matrix |
| `KNOWN_LIMITATIONS.md` | Backend features not yet implemented |
| `backend-version.txt` | Backend package version and branch info |

## API Base

`http://localhost:3000`  
Swagger UI: `http://localhost:3000/api/docs`

## Authentication

All `/admin/*` endpoints require:
```
Authorization: Bearer <accessToken>
```

Obtain a token via `POST /auth/login` with `{ email, password }`.

## Usage in This Project

The OpenAPI spec will be used in **Task 14** to generate a typed API client. Until then, API calls reference this spec manually for type shapes and endpoint paths.
