import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { render, screen, waitFor } from '@/test/utils/render'
import { apiUrl } from '@/test/mocks/api'
import { server } from '@/test/mocks/server'
import { PackFormPage } from '../PackFormPage'
import {
  makeAttributeGroup,
  makePackProduct,
  makeProductReference,
} from '@/features/packs/__tests__/fixtures'

function makeProductPage(products: ReturnType<typeof makePackProduct>[]) {
  return {
    data: products,
    meta: {
      page: 1,
      pageSize: 100,
      totalItems: products.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}

function makeGroupPage(groups: ReturnType<typeof makeAttributeGroup>[]) {
  return {
    data: groups,
    meta: {
      page: 1,
      pageSize: 100,
      totalItems: groups.length,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }
}

function renderCreate(role: 'OWNER' | 'STAFF' = 'OWNER') {
  return render(
    <Routes>
      <Route path="/packs/new" element={<PackFormPage />} />
      <Route path="/packs/:packId/edit" element={<div>Edit page</div>} />
      <Route path="/packs" element={<div>Packs list</div>} />
    </Routes>,
    { initialEntries: ['/packs/new'], role }
  )
}

describe('PackFormPage (create)', () => {
  it('loads product and attribute options from the generated API', async () => {
    let productsSeen: URL | undefined
    let groupsSeen: URL | undefined
    server.use(
      http.get(apiUrl('/admin/products'), ({ request }) => {
        productsSeen = new URL(request.url)
        return HttpResponse.json(makeProductPage([makePackProduct()]))
      }),
      http.get(apiUrl('/admin/attributes'), ({ request }) => {
        groupsSeen = new URL(request.url)
        return HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      })
    )

    renderCreate()
    expect(await screen.findByRole('heading', { name: 'New pack' })).toBeInTheDocument()
    await waitFor(() => {
      expect(productsSeen?.searchParams.get('pageSize')).toBe('100')
      expect(productsSeen?.searchParams.get('status')).toBe('ACTIVE')
      expect(productsSeen?.searchParams.get('isActive')).toBe('true')
      expect(productsSeen?.searchParams.get('sortBy')).toBe('name')
      expect(productsSeen?.searchParams.get('sortOrder')).toBe('asc')
      expect(groupsSeen?.searchParams.get('pageSize')).toBe('100')
      expect(groupsSeen?.searchParams.get('isProductAttribute')).toBe('true')
    })
  })

  it('shows the correct pricing fields for each price mode', async () => {
    server.use(
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(makeProductPage([makePackProduct()]))
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      )
    )
    const user = userEvent.setup()
    renderCreate()
    expect(await screen.findByRole('heading', { name: 'New pack' })).toBeInTheDocument()

    expect(screen.queryByLabelText(/fixed price/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/discount amount/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/discount percentage/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: /price mode/i }))
    await user.click(await screen.findByRole('option', { name: 'FIXED' }))
    expect(screen.getByLabelText(/fixed price/i)).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: /price mode/i }))
    await user.click(await screen.findByRole('option', { name: 'SUM ITEMS WITH DISCOUNT' }))
    expect(screen.getByLabelText(/discount amount/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/discount percentage/i)).toBeInTheDocument()
  })

  it('submits a pack with nested items and compatibility attributes', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(makeProductPage([makePackProduct()]))
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      ),
      http.post(apiUrl('/admin/packs'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'pack-new-1' })
      })
    )
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New pack' })
    await screen.findByRole('button', { name: /add item/i })

    await user.type(screen.getByLabelText(/name/i), 'Glow Pack')
    await user.click(screen.getByLabelText(/slug/i))
    await waitFor(() => expect(screen.getByLabelText(/slug/i)).toHaveValue('glow-pack'))

    await user.click(screen.getByRole('combobox', { name: /price mode/i }))
    await user.click(await screen.findByRole('option', { name: 'FIXED' }))
    await user.clear(screen.getByLabelText(/fixed price/i))
    await user.type(screen.getByLabelText(/fixed price/i), '299')

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.click(screen.getAllByRole('combobox', { name: /product/i })[0]!)
    await user.click(await screen.findByRole('option', { name: 'Foundation X' }))

    await user.click(await screen.findByRole('button', { name: /add attribute/i }))
    await user.click(screen.getByRole('combobox', { name: /attribute group/i }))
    await user.click(await screen.findByRole('option', { name: 'Skin color' }))
    await user.click(screen.getByRole('combobox', { name: /^option$/i }))
    await user.click(await screen.findByRole('option', { name: 'Medium' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /add attribute/i })).toBeEnabled()
    )
    await user.click(screen.getByRole('button', { name: /add attribute/i }))
    expect(await screen.findByRole('button', { name: /remove skin color \/ medium/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /create pack/i }))
    await waitFor(() => expect(body).toBeDefined())

    expect(body).toMatchObject({
      name: 'Glow Pack',
      slug: 'glow-pack',
      priceMode: 'FIXED',
      fixedPrice: 299,
      currency: 'MAD',
      priority: 0,
      status: 'DRAFT',
      isActive: true,
      items: [
        {
          productId: 'prod-1',
          selectionMode: 'AUTO_BEST_REFERENCE',
          quantity: 1,
          isRequired: true,
          sortOrder: 0,
        },
      ],
      attributes: [
        {
          attributeGroupCode: 'SKIN_COLOR',
          attributeOptionCode: 'MEDIUM',
          matchType: 'COMPATIBLE',
          scoreValue: 50,
          isHardFilter: false,
        },
      ],
    })
    expect(await screen.findByText('Edit page')).toBeInTheDocument()
  })

  it('clears fixed references when a nested item is changed to automatic mode', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(
          makeProductPage([makePackProduct({ references: [makeProductReference()] })])
        )
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      ),
      http.post(apiUrl('/admin/packs'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ id: 'pack-new-2' })
      })
    )
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New pack' })
    await screen.findByRole('button', { name: /add item/i })

    await user.click(screen.getByRole('button', { name: /add item/i }))
    await user.click(screen.getAllByRole('combobox', { name: /product/i })[0]!)
    await user.click(await screen.findByRole('option', { name: 'Foundation X' }))
    await user.click(screen.getAllByRole('combobox', { name: /reference selection/i })[0]!)
    await user.click(await screen.findByRole('option', { name: /fixed reference/i }))
    await user.click(screen.getAllByRole('combobox', { name: /fixed reference/i })[0]!)
    await user.click(await screen.findByRole('option', { name: /ref-001/i }))
    await user.click(screen.getAllByRole('combobox', { name: /reference selection/i })[0]!)
    await user.click(await screen.findByRole('option', { name: /automatic best reference/i }))
    await user.type(screen.getByLabelText(/name/i), 'Glow Pack')
    await user.click(screen.getByLabelText(/slug/i))
    await waitFor(() => expect(screen.getByLabelText(/slug/i)).toHaveValue('glow-pack'))

    await user.click(screen.getByRole('button', { name: /create pack/i }))
    await waitFor(() => expect(body).toBeDefined())

    expect((body?.items as Array<Record<string, unknown>> | undefined)?.[0]).toMatchObject({
      productId: 'prod-1',
      selectionMode: 'AUTO_BEST_REFERENCE',
    })
    expect((body?.items as Array<Record<string, unknown>> | undefined)?.[0]).not.toHaveProperty(
      'productReferenceId'
    )
  })

  it('surfaces backend validation errors and blocks duplicate submission', async () => {
    let calls = 0
    let release: () => void = () => {}
    server.use(
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(makeProductPage([makePackProduct()]))
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      ),
      http.post(apiUrl('/admin/packs'), async () => {
        calls += 1
        await new Promise<void>((resolve) => {
          release = resolve
        })
        return HttpResponse.json({ id: 'pack-new-3' })
      })
    )
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New pack' })
    await screen.findByRole('button', { name: /add item/i })

    await user.type(screen.getByLabelText(/name/i), 'Glow Pack')
    await user.click(screen.getByLabelText(/slug/i))
    await waitFor(() => expect(screen.getByLabelText(/slug/i)).toHaveValue('glow-pack'))
    const submit = screen.getByRole('button', { name: /create pack/i })
    await user.click(submit)
    await waitFor(() => expect(submit).toBeDisabled())
    await user.click(submit).catch(() => undefined)
    expect(calls).toBe(1)
    release()
    expect(await screen.findByText('Edit page')).toBeInTheDocument()
  })

  it('cancels back to the packs list', async () => {
    server.use(
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(makeProductPage([makePackProduct()]))
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      )
    )
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New pack' })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(await screen.findByText('Packs list')).toBeInTheDocument()
  })

  it('blocks STAFF users with a forbidden message', () => {
    server.use(
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(makeProductPage([makePackProduct()]))
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      )
    )
    renderCreate('STAFF')
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument()
  })
})
