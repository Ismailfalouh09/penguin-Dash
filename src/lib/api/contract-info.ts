/**
 * Static metadata about the backend API contract the generated client targets.
 *
 * Kept as a small handwritten constant (rather than importing the ~200 KB
 * `openapi.json`) so the spec is never bundled into the app. Update these
 * values whenever the handoff OpenAPI files are replaced and the client is
 * regenerated — they are surfaced read-only by the dev diagnostics page.
 *
 * Source of truth: frontend-handoff/openapi.json (info) and
 * frontend-handoff/backend-version.txt.
 */
export const API_CONTRACT = {
  /** OpenAPI `info.title`. */
  title: 'Beauty Pack Recommendation API',
  /** OpenAPI `info.version`. */
  version: '1.0.0',
  /** OpenAPI document version. */
  openapi: '3.0.0',
  /** Backend package@version from backend-version.txt. */
  backendPackage: 'recommended-packs-backend@0.0.1',
  /** Handoff milestone from backend-version.txt. */
  handoff: 'Task 15.5 Admin Dashboard Backend Readiness',
  /** Relative path of the contract used for generation. */
  source: 'frontend-handoff/openapi.json',
} as const

export type ApiContractInfo = typeof API_CONTRACT
