import { http, HttpResponse } from 'msw'
import { apiUrl } from '@/test/mocks/api'
import type { ProductResponse, MediaImageResponse } from '@/lib/api'

/** MSW handlers returning category/brand option lists for product form selects. */
export function selectOptionHandlers() {
  const categories = makeProductPage([{ id: 'cat-1', code: 'FACE', name: 'Face' }] as never, {
    pageSize: 100,
  })
  const brands = makeProductPage([{ id: 'brand-1', name: 'Acme' }] as never, { pageSize: 100 })
  return [
    http.get(apiUrl('/admin/categories'), () => HttpResponse.json(categories)),
    http.get(apiUrl('/admin/brands'), () => HttpResponse.json(brands)),
  ]
}

/** Build a media image fixture with sensible URL variants. */
export function makeImage(overrides: Partial<MediaImageResponse> = {}): MediaImageResponse {
  return {
    id: 'img-1',
    mediaAssetId: 'asset-1',
    role: 'GALLERY',
    position: 0,
    urls: {
      original: 'https://cdn.test/original.jpg',
      thumbnail: 'https://cdn.test/thumb.jpg',
      card: 'https://cdn.test/card.jpg',
      detail: 'https://cdn.test/detail.jpg',
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

/** Build a product fixture. */
export function makeProduct(overrides: Partial<ProductResponse> = {}): ProductResponse {
  return {
    id: 'prod-1',
    name: 'Foundation X',
    slug: 'foundation-x',
    basePrice: 199.99,
    currency: 'MAD',
    status: 'ACTIVE',
    category: { id: 'cat-1', code: 'FACE', name: 'Face' },
    brand: { id: 'brand-1', name: 'Acme' },
    references: [],
    coverImage: null,
    images: [],
    ...overrides,
  }
}

/** Wrap a list of products in the backend's paginated envelope. */
export function makeProductPage(
  products: ProductResponse[],
  meta: Partial<{
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }> = {}
) {
  const page = meta.page ?? 1
  const pageSize = meta.pageSize ?? 20
  const totalItems = meta.totalItems ?? products.length
  return {
    data: products,
    meta: {
      page,
      pageSize,
      totalItems,
      totalPages: meta.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize)),
      hasNextPage: meta.hasNextPage ?? false,
      hasPreviousPage: meta.hasPreviousPage ?? false,
    },
  }
}
