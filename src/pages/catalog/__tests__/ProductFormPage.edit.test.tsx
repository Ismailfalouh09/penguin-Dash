import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@/test/utils/render'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { ProductFormPage } from '../ProductFormPage'
import { makeProduct, selectOptionHandlers } from '@/features/products/__tests__/fixtures'

function renderEdit(role: 'OWNER' | 'STAFF' = 'OWNER') {
  return render(
    <Routes>
      <Route path="/products/:productId/edit" element={<ProductFormPage />} />
      <Route path="/products/:productId" element={<div>Detail page</div>} />
    </Routes>,
    { initialEntries: ['/products/prod-1/edit'], role }
  )
}

describe('ProductFormPage (edit)', () => {
  it('loads the product and pre-fills the form', async () => {
    server.use(
      ...selectOptionHandlers(),
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json(makeProduct({ name: 'Foundation X', slug: 'foundation-x' }))
      )
    )
    renderEdit()
    expect(await screen.findByDisplayValue('Foundation X')).toBeInTheDocument()
    expect(screen.getByDisplayValue('foundation-x')).toBeInTheDocument()
  })

  it('handles a missing product safely', async () => {
    server.use(
      ...selectOptionHandlers(),
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json({ statusCode: 404, message: 'gone' }, { status: 404 })
      )
    )
    renderEdit()
    expect(await screen.findByText('Could not load product details.')).toBeInTheDocument()
  })

  it('submits an update with the supported fields and invalidates queries', async () => {
    let body: Record<string, unknown> | undefined
    let detailFetches = 0
    server.use(
      ...selectOptionHandlers(),
      http.get(apiUrl('/admin/products/prod-1'), () => {
        detailFetches += 1
        return HttpResponse.json(makeProduct({ name: 'Foundation X', slug: 'foundation-x' }))
      }),
      http.patch(apiUrl('/admin/products/prod-1'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(makeProduct())
      })
    )
    const user = userEvent.setup()
    renderEdit()
    const nameInput = await screen.findByDisplayValue('Foundation X')
    await user.clear(nameInput)
    await user.type(nameInput, 'Foundation Y')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    await waitFor(() => expect(body).toBeDefined())
    expect(body).toMatchObject({ name: 'Foundation Y', slug: 'foundation-x' })
    // Only supported fields are present.
    expect(Object.keys(body!)).toEqual(
      expect.arrayContaining(['name', 'slug', 'categoryId', 'basePrice', 'currency'])
    )
    // Redirect back to detail + detail refetched (invalidation).
    expect(await screen.findByText('Detail page')).toBeInTheDocument()
    await waitFor(() => expect(detailFetches).toBeGreaterThan(1))
  })

  it('surfaces backend validation errors on update', async () => {
    server.use(
      ...selectOptionHandlers(),
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json(makeProduct({ name: 'Foundation X' }))
      ),
      http.patch(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json({ statusCode: 409, message: 'Slug taken' }, { status: 409 })
      )
    )
    const user = userEvent.setup()
    renderEdit()
    await screen.findByDisplayValue('Foundation X')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText('Update failed')).toBeInTheDocument()
    expect(screen.queryByText('Detail page')).not.toBeInTheDocument()
  })

  it('blocks STAFF from the edit form', async () => {
    server.use(
      ...selectOptionHandlers(),
      http.get(apiUrl('/admin/products/prod-1'), () => HttpResponse.json(makeProduct()))
    )
    renderEdit('STAFF')
    expect(await screen.findByText(/do not have permission/i)).toBeInTheDocument()
  })

  it('shows the image gallery section in edit mode', async () => {
    server.use(
      ...selectOptionHandlers(),
      http.get(apiUrl('/admin/products/prod-1'), () => HttpResponse.json(makeProduct()))
    )
    renderEdit()
    await screen.findByDisplayValue('Foundation X')
    expect(screen.getByRole('heading', { name: 'Cover image' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Gallery' })).toBeInTheDocument()
  })
})
