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
  makePack,
  makePackAttribute,
  makePackItem,
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

function renderEdit(role: 'OWNER' | 'STAFF' = 'OWNER') {
  return render(
    <Routes>
      <Route path="/packs/:packId/edit" element={<PackFormPage />} />
      <Route path="/packs/:packId" element={<div>Pack detail page</div>} />
      <Route path="/packs" element={<div>Packs list</div>} />
    </Routes>,
    { initialEntries: ['/packs/pack-1/edit'], role }
  )
}

describe('PackFormPage (edit)', () => {
  it('loads the pack, pre-fills nested values, and shows the media section', async () => {
    server.use(
      http.get(apiUrl('/admin/packs/pack-1'), () =>
        HttpResponse.json(
          makePack({
            name: 'Glow Pack',
            slug: 'glow-pack',
            items: [
              makePackItem({
                selectionMode: 'FIXED_REFERENCE',
                product: makePackProduct({
                  references: [makeProductReference()],
                }),
                productReference: makeProductReference(),
              }),
            ],
            attributes: [makePackAttribute()],
          })
        )
      ),
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(
          makeProductPage([makePackProduct({ references: [makeProductReference()] })])
        )
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      )
    )

    renderEdit()
    expect(await screen.findByDisplayValue('Glow Pack')).toBeInTheDocument()
    expect(screen.getByDisplayValue('glow-pack')).toBeInTheDocument()
    expect((await screen.findAllByText('Skin color')).length).toBeGreaterThan(0)
    expect((await screen.findAllByText('Medium')).length).toBeGreaterThan(0)
    expect(screen.getByText('Cover image')).toBeInTheDocument()
    expect(screen.getByText('Gallery')).toBeInTheDocument()
  })

  it('submits the updated pack and navigates to the detail page', async () => {
    let body: Record<string, unknown> | undefined
    let detailFetches = 0
    server.use(
      http.get(apiUrl('/admin/packs/pack-1'), () => {
        detailFetches += 1
        return HttpResponse.json(
          makePack({
            name: 'Glow Pack',
            slug: 'glow-pack',
            items: [
              makePackItem({
                selectionMode: 'FIXED_REFERENCE',
                product: makePackProduct({
                  references: [makeProductReference()],
                }),
                productReference: makeProductReference(),
              }),
            ],
            attributes: [makePackAttribute()],
          })
        )
      }),
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(
          makeProductPage([makePackProduct({ references: [makeProductReference()] })])
        )
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      ),
      http.patch(apiUrl('/admin/packs/pack-1'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    renderEdit()

    const nameInput = await screen.findByDisplayValue('Glow Pack')
    await user.clear(nameInput)
    await user.type(nameInput, 'Glow Pack Revised')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(body).toBeDefined())
    expect(body).toMatchObject({
      name: 'Glow Pack Revised',
      slug: 'glow-pack',
      items: [
        {
          selectionMode: 'FIXED_REFERENCE',
          productId: 'prod-1',
          productReferenceId: 'ref-1',
        },
      ],
      attributes: [
        {
          attributeGroupCode: 'SKIN_COLOR',
          attributeOptionCode: 'MEDIUM',
        },
      ],
    })
    expect(await screen.findByText('Pack detail page')).toBeInTheDocument()
    await waitFor(() => expect(detailFetches).toBeGreaterThan(1))
  })

  it('surfaces backend validation errors on update', async () => {
    server.use(
      http.get(apiUrl('/admin/packs/pack-1'), () => HttpResponse.json(makePack())),
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(makeProductPage([makePackProduct()]))
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      ),
      http.patch(apiUrl('/admin/packs/pack-1'), () =>
        HttpResponse.json({ statusCode: 409, message: 'Slug already exists' }, { status: 409 })
      )
    )
    const user = userEvent.setup()
    renderEdit()

    await screen.findByDisplayValue('Glow Pack')
    await user.click(screen.getByRole('button', { name: /save changes/i }))
    expect(await screen.findByText('Could not update pack')).toBeInTheDocument()
    expect(screen.queryByText('Pack detail page')).not.toBeInTheDocument()
  })

  it('blocks STAFF users from editing packs', async () => {
    server.use(http.get(apiUrl('/admin/packs/pack-1'), () => HttpResponse.json(makePack())))
    renderEdit('STAFF')
    expect(await screen.findByText(/do not have permission/i)).toBeInTheDocument()
  })

  it('cancels back to the pack detail page', async () => {
    server.use(
      http.get(apiUrl('/admin/packs/pack-1'), () => HttpResponse.json(makePack())),
      http.get(apiUrl('/admin/products'), () =>
        HttpResponse.json(makeProductPage([makePackProduct()]))
      ),
      http.get(apiUrl('/admin/attributes'), () =>
        HttpResponse.json(makeGroupPage([makeAttributeGroup()]))
      )
    )
    const user = userEvent.setup()
    renderEdit()
    await screen.findByDisplayValue('Glow Pack')
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(await screen.findByText('Pack detail page')).toBeInTheDocument()
  })
})
