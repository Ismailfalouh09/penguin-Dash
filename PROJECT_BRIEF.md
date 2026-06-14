# Project Brief — Penguin Beauty Admin Dashboard

## What This Is

An internal admin dashboard for managing a beauty-pack recommendation system. Admins can manage products, categories, brands, packs, quiz questions, recommendation rules, and orders through this interface.

## Target Users

Three admin roles with different permissions:

| Role | Can Read | Can Create/Update/Delete | Can Manage Stock |
|---|---|---|---|
| OWNER | All | All | Yes |
| ADMIN | All | All | Yes |
| STAFF | All | No | No |

## Backend

- REST API at `http://localhost:3000`
- Authentication: JWT Bearer token (8-hour expiry)
- OpenAPI spec: `frontend-handoff/openapi.json`

## Key Domain Concepts

- **Products** — beauty items with image galleries and variants (SKUs)
- **Product References** — SKU variants with stock and swatch images
- **Packs** — curated bundles of products
- **Categories** — hierarchical product categories
- **Brands** — product brand entities
- **Attributes** — quiz attribute groups and options (e.g., skin type, concern)
- **Quiz** — ordered set of questions for product recommendations
- **Recommendation Rules** — logic matching quiz answers to pack recommendations
- **Orders** — customer orders (Cash on Delivery only)

## Technical Constraints

- Cash on Delivery is the only payment method
- No refresh token flow (token expires after 8 hours; user must re-login)
- No customer-facing authentication in this dashboard
- Some media endpoints are not yet implemented (brand logos, attribute option images)

## Out of Scope for Dashboard

- Customer authentication
- Stock reservation
- WhatsApp/delivery provider integration
- Admin user management CRUD
- Online payment processing
