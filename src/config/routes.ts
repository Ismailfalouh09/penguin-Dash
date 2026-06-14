/**
 * Central route path registry.
 *
 * Static paths are plain strings; parameterized paths are builder functions
 * that default to the React Router pattern (e.g. ':productId') so the same
 * constant serves both route definitions and link generation.
 */
export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',

  categories: '/categories',
  categoryNew: '/categories/new',
  categoryEdit: (categoryId = ':categoryId') => `/categories/${categoryId}/edit`,

  brands: '/brands',
  brandNew: '/brands/new',
  brandEdit: (brandId = ':brandId') => `/brands/${brandId}/edit`,

  products: '/products',
  productNew: '/products/new',
  product: (productId = ':productId') => `/products/${productId}`,
  productEdit: (productId = ':productId') => `/products/${productId}/edit`,
  productReferences: (productId = ':productId') => `/products/${productId}/references`,

  packs: '/packs',
  packNew: '/packs/new',
  pack: (packId = ':packId') => `/packs/${packId}`,
  packEdit: (packId = ':packId') => `/packs/${packId}/edit`,

  attributes: '/attributes',
  quiz: '/quiz',
  recommendationRules: '/recommendation-rules',

  orders: '/orders',
  order: (orderId = ':orderId') => `/orders/${orderId}`,

  media: '/media',

  profile: '/profile',
  forbidden: '/forbidden',

  /** Development-only API diagnostics. */
  diagnostics: '/diagnostics',
  /** Development-only shared-components demo (Task 5A). */
  componentsDemo: '/components-demo',
} as const
