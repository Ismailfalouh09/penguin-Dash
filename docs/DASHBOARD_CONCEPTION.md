# Dashboard Conception

The information architecture, navigation, routes, and role visibility for the
Penguin Beauty admin dashboard. Defined in Task 2 before authentication and CRUD.

## Sitemap

```
Overview
└─ Overview (dashboard)

Catalog
├─ Categories
├─ Brands
├─ Products
│  ├─ Product details
│  ├─ New / Edit product
│  └─ Product references   (managed within a product)
├─ Packs
│  ├─ Pack details
│  └─ New / Edit pack
└─ Media library

Personalization
├─ Attributes
├─ Quiz
└─ Recommendation rules

Sales
└─ Orders
   └─ Order details

Administration
└─ Profile

System (not in sidebar)
├─ Login          (standalone, no shell)
├─ Access denied  (403)
└─ Not found      (404)
```

> Product references are intentionally **not** a standalone sidebar destination.
> They belong to a product and are reached via the product workspace
> (`/products/:productId/references`), matching the backend, which exposes
> references only under a product.

## Navigation hierarchy

Navigation is defined once in [`src/config/navigation.ts`](../src/config/navigation.ts)
as an ordered list of groups, each with items. No sidebar item is hardcoded in a
component — the desktop sidebar and the mobile drawer both render this config.

| Group | Items |
| --- | --- |
| Overview | Overview |
| Catalog | Categories, Brands, Products, Packs, Media library |
| Personalization | Attributes, Quiz, Recommendation rules |
| Sales | Orders |
| Administration | Profile |

Each item carries: `id`, `label`, `to` (route), `icon`, optional
`requiredPermission` (defaults to `read`), and an optional `description`.

## Route map

Route constants live in [`src/config/routes.ts`](../src/config/routes.ts). The
router is in [`src/app/router.tsx`](../src/app/router.tsx).

| Path | Page | Shell | Notes |
| --- | --- | --- | --- |
| `/login` | Login placeholder | No | Standalone; design preview only |
| `/` | → `/dashboard` | Yes | Index redirect |
| `/dashboard` | Overview | Yes | Operational summary (no live metrics yet) |
| `/categories` | Categories | Yes | List placeholder |
| `/brands` | Brands | Yes | List placeholder |
| `/products` | Products | Yes | List placeholder |
| `/products/new` | Product form | Yes | Create placeholder |
| `/products/:productId` | Product details | Yes | Detail placeholder |
| `/products/:productId/edit` | Product form | Yes | Edit placeholder |
| `/products/:productId/references` | Product references | Yes | References placeholder |
| `/packs` | Packs | Yes | Pack list with search, filters, and archive actions |
| `/packs/new` | Pack form | Yes | Create a curated bundle |
| `/packs/:packId` | Pack details | Yes | Bundle details, pack items, compatibility, and media |
| `/packs/:packId/edit` | Pack form | Yes | Edit bundle configuration and gallery |
| `/attributes` | Attributes | Yes | List placeholder |
| `/quiz` | Quiz | Yes | List placeholder |
| `/recommendation-rules` | Recommendation rules | Yes | List placeholder |
| `/orders` | Orders | Yes | List placeholder |
| `/orders/:orderId` | Order details | Yes | Detail placeholder |
| `/media` | Media library | Yes | List placeholder |
| `/profile` | Profile | Yes | Shows placeholder user |
| `/forbidden` | Access denied | Yes | 403 |
| `*` | Not found | Yes | 404 inside the shell |

All routes except `/login` render inside the dashboard shell so navigation is
always available — including the 404 and 403 pages. Each route declares a
`handle: { title, breadcrumb }` consumed by the layout for the document title
and breadcrumb trail.

## Main workflows

- **Catalog management**: create/edit products → manage gallery → manage
  references and stock → compose packs → manage pack media.
- **Personalization**: define attributes & options → author quiz questions →
  write recommendation rules that map answers to packs → preview results.
- **Fulfilment**: review orders → open an order → update its status.
- **Media**: upload assets, attach them to catalog entities.

## Role visibility rules

Source of truth: [`frontend-handoff/ROLE_PERMISSION_MATRIX.md`](../frontend-handoff/ROLE_PERMISSION_MATRIX.md).
Mirrored for UI affordances in [`src/features/auth/roles.ts`](../src/features/auth/roles.ts).

| Capability | OWNER | ADMIN | STAFF |
| --- | --- | --- | --- |
| View any admin page (`read`) | ✅ | ✅ | ✅ |
| Create / edit / delete (`write`) | ✅ | ✅ | ❌ |
| Manage media (`media:manage`) | ✅ | ✅ | ❌ |
| Update order status | ✅ | ✅ | ❌ |
| Preview recommendations | ✅ | ✅ | ✅ |

Because every role can **read** every page, all sidebar destinations are visible
to all three roles. The role split surfaces on **actions**: write controls are
wrapped in [`PermissionGuard`](../src/shared/components/common/PermissionGuard.tsx)
and hidden for STAFF. The navigation config still supports per-item permission
gating (`requiredPermission`) so future write-only destinations can be hidden
without touching the shell.

> The frontend hides actions only for usability. The backend remains the
> authoritative authorization gate for every request.
