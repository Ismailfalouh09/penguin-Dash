# Design System

A clean, modern, soft and professional visual system for the Penguin Beauty
admin dashboard. Light mode first; dark mode is prepared via tokens but not a
focus. Tokens live in [`src/styles/globals.css`](../src/styles/globals.css) and
are wired into Tailwind in [`tailwind.config.ts`](../tailwind.config.ts).

## Principles

- Calm, warm neutrals with a single refined accent — not a customer storefront.
- Color is never the only signal (status pairs color + label + dot/icon).
- Generous spacing, soft shadows, restrained motion (reduced-motion respected).
- High-contrast text for scannability.

## Color tokens

All colors are raw HSL channels exposed as CSS variables and consumed via
`hsl(var(--token))`, which keeps opacity modifiers (`bg-primary/90`,
`bg-success/10`) working.

| Token | Light value (HSL) | Usage |
| --- | --- | --- |
| `--background` | `30 33% 99%` | App canvas (warm off-white) |
| `--foreground` | `326 16% 15%` | Primary text |
| `--card` / `--popover` | `0 0% 100%` | Surfaces |
| `--primary` | `327 36% 30%` | Brand accent (muted aubergine) |
| `--primary-foreground` | `30 33% 99%` | Text on primary |
| `--secondary` / `--muted` | `24 20% 95%` | Subtle fills |
| `--muted-foreground` | `326 7% 44%` | Secondary text |
| `--accent` | `338 44% 95%` | Soft rose highlight surface |
| `--border` / `--input` | `24 16% 90%` | Lines & field borders |
| `--ring` | `327 36% 30%` | Focus ring |
| `--destructive` | `0 72% 48%` | Errors / destructive |
| `--success` | `142 52% 34%` | Success |
| `--warning` | `35 92% 42%` | Warning |
| `--info` | `214 78% 47%` | Information |

Semantic colors (`success`, `warning`, `info`, `destructive`) are available as
Tailwind utilities: `bg-success`, `text-success`, `bg-success/10`, etc. A dark
theme mirror is defined under `.dark` for future use.

## Typography

- Font: **Inter** with a system-ui fallback stack (`font-sans`).
- Hierarchy:
  - Page title — `text-2xl font-semibold tracking-tight`
  - Section / card title — `text-base font-semibold`
  - Body — `text-sm`
  - Secondary / meta — `text-xs text-muted-foreground`
  - Eyebrow labels — `text-xs font-medium uppercase tracking-wide`

## Spacing & layout

- Tailwind's 4px spacing scale.
- Page padding: `px-4 sm:px-6 lg:px-8`, vertical `py-6` (via `PageContainer`).
- Content max width: `max-w-7xl`, centered.
- Section rhythm: `space-y-6` between page sections.

## Radius

`--radius: 0.625rem`. Tailwind maps `rounded-lg` = radius, `rounded-md` =
radius − 2px, `rounded-sm` = radius − 4px.

## Shadows

Custom soft shadow scale (warm-tinted, low opacity):

| Utility | Use |
| --- | --- |
| `shadow-soft` | Subtle lift (metric tiles, logo mark) |
| `shadow-card` | Standard cards |
| `shadow-elevated` | Popovers, dialogs, drawers |

## Component conventions

- shadcn/ui primitives live in `src/shared/components/ui/` and are not edited;
  app components wrap them.
- App-level building blocks live in `src/shared/components/common/`:
  `AppLogo`, `PageContainer`, `PageHeader`, `SectionCard`, `StatusBadge`,
  `EmptyState`, `ErrorState`, `LoadingState`, `ComingSoonState`, `DesignPreview`,
  `PermissionGuard`.
- Icons: [`lucide-react`](https://lucide.dev). Decorative icons get
  `aria-hidden="true"`; icon-only controls get an `aria-label`.

## Status styling

`StatusBadge` maps a tone to a soft, accessible pill — color **plus** text and an
optional dot, never color alone.

| Tone | Appearance |
| --- | --- |
| `neutral` | Muted grey |
| `success` | Green tint |
| `warning` | Amber tint |
| `error` | Red tint |
| `info` | Blue tint |

## Standard page states

Reusable across every future module:

- **Loading** — `LoadingState` skeletons (`page` / `table` / `cards` / `inline`),
  never a blank screen. Announces `role="status" aria-busy`.
- **Empty** — `EmptyState` with icon, title, short explanation, optional action.
- **Error** — `ErrorState` with a friendly message and optional retry; never a
  raw stack trace. Announces `role="alert"`.
- **Forbidden** — dedicated 403 page explaining the missing permission.
- **Not found** — dedicated 404 page with a route back to the dashboard.

## Responsive rules

| Breakpoint | Behavior |
| --- | --- |
| `< lg` (mobile/tablet) | Sidebar hidden; hamburger opens the Sheet drawer |
| `≥ lg` (desktop) | Persistent sidebar; collapsible to a 72px icon rail |
| `< sm` | Page headers stack; breadcrumbs hidden in the top bar |

Sidebar collapse state persists in `localStorage`.

## Accessibility

- Visible focus ring on every focusable element (`:focus-visible` in globals).
- Skip-to-content link as the first focusable element in the shell.
- Keyboard-operable navigation, drawer, menus, tabs (Radix primitives).
- `prefers-reduced-motion` disables animations/transitions.
- Status is conveyed by text + icon/dot, not color alone.
