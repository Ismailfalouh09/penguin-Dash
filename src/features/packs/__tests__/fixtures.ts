import type {
  AttributeMatchResponse,
  AttributeOptionResponse,
  AttributeGroupResponse,
  MediaImageResponse,
  PackItemResponse,
  PackResponse,
  ProductReferenceResponse,
  ProductResponse,
} from '@/lib/api'

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

export function makePackProduct(overrides: Partial<ProductResponse> = {}): ProductResponse {
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

export function makeProductReference(
  overrides: Partial<ProductReferenceResponse> = {}
): ProductReferenceResponse {
  return {
    id: 'ref-1',
    referenceCode: 'REF-001',
    referenceName: 'Reference One',
    sku: 'SKU-001' as unknown as ProductReferenceResponse['sku'],
    barcode: '1234567890123' as unknown as ProductReferenceResponse['barcode'],
    priceDelta: 0,
    stockQuantity: 12,
    reservedQuantity: 0,
    isActive: true,
    image: null,
    attributes: [],
    ...overrides,
  }
}

export function makeAttributeGroup(
  overrides: Partial<AttributeGroupResponse> = {},
  options: AttributeOptionResponse[] = [
    { id: 'opt-1', code: 'MEDIUM', label: 'Medium' },
    { id: 'opt-2', code: 'LIGHT', label: 'Light' },
  ]
): AttributeGroupResponse {
  return {
    id: 'group-1',
    code: 'SKIN_COLOR',
    name: 'Skin color',
    options,
    ...overrides,
  }
}

export function makePackItem(overrides: Partial<PackItemResponse> = {}): PackItemResponse {
  return {
    id: 'pack-item-1',
    selectionMode: 'AUTO_BEST_REFERENCE',
    quantity: 1,
    isRequired: true,
    product: makePackProduct(),
    productReference: null,
    ...overrides,
  }
}

export function makePackAttribute(
  overrides: Partial<AttributeMatchResponse> = {}
): AttributeMatchResponse {
  return {
    id: 'attr-1',
    matchType: 'COMPATIBLE',
    scoreValue: 80,
    isHardFilter: false,
    attributeGroup: { code: 'SKIN_COLOR', name: 'Skin color' },
    attributeOption: { id: 'opt-1', code: 'MEDIUM', label: 'Medium' },
    ...overrides,
  }
}

export function makePack(overrides: Partial<PackResponse> = {}): PackResponse {
  return {
    id: 'pack-1',
    name: 'Glow Pack',
    slug: 'glow-pack',
    priceMode: 'FIXED',
    fixedPrice: 299 as unknown as PackResponse['fixedPrice'],
    status: 'ACTIVE',
    isActive: true,
    attributes: [makePackAttribute()],
    items: [makePackItem()],
    coverImage: makeImage({ id: 'cover-1', role: 'COVER' }),
    images: [makeImage({ id: 'gallery-1', role: 'GALLERY', position: 0 })],
    ...overrides,
  }
}

export function makePackPage(
  packs: PackResponse[],
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
  const totalItems = meta.totalItems ?? packs.length

  return {
    data: packs,
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
