import {
  LayoutDashboard,
  FolderTree,
  Tag,
  Package,
  Boxes,
  Image,
  SlidersHorizontal,
  ClipboardList,
  Sparkles,
  ShoppingCart,
  UserCircle,
  type LucideIcon,
} from 'lucide-react'
import type { Permission, Role } from '@/features/auth/roles'
import { hasPermission } from '@/features/auth/roles'
import { ROUTES } from './routes'

export interface NavItem {
  /** Stable id, used as a React key and test handle. */
  id: string
  label: string
  to: string
  icon: LucideIcon
  /** Capability required to see this item. Defaults to 'read' (all roles). */
  requiredPermission?: Permission
  /** Short description surfaced in tooltips / the command palette later. */
  description?: string
}

export interface NavGroup {
  id: string
  /** Group heading. `null` renders the items without a section label. */
  label: string | null
  items: NavItem[]
}

/**
 * Single source of truth for dashboard navigation.
 *
 * Every business module is reachable from here — no sidebar item is hardcoded
 * in a component. Items default to the 'read' permission, which every role
 * holds, so the full map is visible to OWNER, ADMIN and STAFF. The
 * `requiredPermission` field exists so future write-only destinations can be
 * gated without touching the shell. Backend authorization stays authoritative.
 *
 * Note: product references are managed within a product
 * (`/products/:productId/references`) and intentionally have no standalone
 * sidebar entry — they appear in the product workspace, not the top level.
 */
export const NAVIGATION: NavGroup[] = [
  {
    id: 'overview',
    label: null,
    items: [
      {
        id: 'dashboard',
        label: 'Overview',
        to: ROUTES.dashboard,
        icon: LayoutDashboard,
        description: 'Operational summary and quick actions',
      },
    ],
  },
  {
    id: 'catalog',
    label: 'Catalog',
    items: [
      {
        id: 'categories',
        label: 'Categories',
        to: ROUTES.categories,
        icon: FolderTree,
        description: 'Organize products into categories',
      },
      {
        id: 'brands',
        label: 'Brands',
        to: ROUTES.brands,
        icon: Tag,
        description: 'Manage product brands',
      },
      {
        id: 'products',
        label: 'Products',
        to: ROUTES.products,
        icon: Package,
        description: 'Products, images and references',
      },
      {
        id: 'packs',
        label: 'Packs',
        to: ROUTES.packs,
        icon: Boxes,
        description: 'Curated product bundles',
      },
      {
        id: 'media',
        label: 'Media library',
        to: ROUTES.media,
        icon: Image,
        description: 'Catalog imagery and uploads',
      },
    ],
  },
  {
    id: 'personalization',
    label: 'Personalization',
    items: [
      {
        id: 'attributes',
        label: 'Attributes',
        to: ROUTES.attributes,
        icon: SlidersHorizontal,
        description: 'Quiz attribute groups and options',
      },
      {
        id: 'quiz',
        label: 'Quiz',
        to: ROUTES.quiz,
        icon: ClipboardList,
        description: 'Quiz questions and ordering',
      },
      {
        id: 'recommendation-rules',
        label: 'Recommendation rules',
        to: ROUTES.recommendationRules,
        icon: Sparkles,
        description: 'Rules that map answers to packs',
      },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    items: [
      {
        id: 'orders',
        label: 'Orders',
        to: ROUTES.orders,
        icon: ShoppingCart,
        description: 'Customer orders and fulfilment status',
      },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    items: [
      {
        id: 'profile',
        label: 'Profile',
        to: ROUTES.profile,
        icon: UserCircle,
        description: 'Your account details',
      },
    ],
  },
]

/**
 * Filter the navigation for a given role, dropping any item whose required
 * permission the role lacks, plus any group left empty as a result.
 */
export function getNavigationForRole(role: Role): NavGroup[] {
  return NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => hasPermission(role, item.requiredPermission ?? 'read')),
  })).filter((group) => group.items.length > 0)
}

/** Flat list of every nav item, regardless of role. */
export const ALL_NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((group) => group.items)
