import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { render, screen, within, waitFor } from '@/test/utils/render'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { ProductDetailPage } from '../ProductDetailPage'
import { makeProduct, makeImage } from '@/features/products/__tests__/fixtures'

function renderDetail(productId = 'prod-1', role: 'OWNER' | 'STAFF' = 'OWNER') {
  return render(
    <Routes>
      <Route path="/products/:productId" element={<ProductDetailPage />} />
      <Route path="/products/:productId/edit" element={<div>Edit page</div>} />
      <Route path="/products/:productId/references" element={<div>References page</div>} />
    </Routes>,
    { initialEntries: [`/products/${productId}`], role }
  )
}

describe('ProductDetailPage', () => {
  it('loads and renders product details', async () => {
    server.use(
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json(makeProduct({ name: 'Foundation X', slug: 'foundation-x' }))
      )
    )
    renderDetail()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Foundation X' })
    ).toBeInTheDocument()
    // Category + brand render
    expect(screen.getByText('Face')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('renders the cover and gallery images', async () => {
    server.use(
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json(
          makeProduct({
            coverImage: makeImage({ id: 'cover', role: 'COVER' }),
            images: [
              makeImage({ id: 'g1', role: 'GALLERY', position: 0 }),
              makeImage({ id: 'g2', role: 'GALLERY', position: 1 }),
            ],
          })
        )
      )
    )
    renderDetail()
    expect(await screen.findByAltText('Product cover')).toBeInTheDocument()
    expect(screen.getAllByAltText('Gallery image')).toHaveLength(2)
  })

  it('shows a safe error state for a missing product', async () => {
    server.use(
      http.get(apiUrl('/admin/products/missing'), () =>
        HttpResponse.json({ statusCode: 404, message: 'not found' }, { status: 404 })
      )
    )
    renderDetail('missing')
    expect(await screen.findByText('Could not load product details.')).toBeInTheDocument()
  })

  it('offers edit navigation for authorized roles', async () => {
    server.use(http.get(apiUrl('/admin/products/prod-1'), () => HttpResponse.json(makeProduct())))
    renderDetail('prod-1', 'OWNER')
    const editLink = await screen.findByRole('link', { name: /edit/i })
    expect(editLink).toHaveAttribute('href', '/products/prod-1/edit')
  })

  it('hides write actions for STAFF', async () => {
    server.use(http.get(apiUrl('/admin/products/prod-1'), () => HttpResponse.json(makeProduct())))
    renderDetail('prod-1', 'STAFF')
    await screen.findByRole('heading', { level: 1, name: 'Foundation X' })
    expect(screen.queryByRole('link', { name: /^edit$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /archive/i })).not.toBeInTheDocument()
  })

  it('presents the references link without implementing Task 8', async () => {
    server.use(
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json(makeProduct({ references: [] }))
      )
    )
    renderDetail()
    const refLink = await screen.findByRole('link', { name: /references/i })
    expect(refLink).toHaveAttribute('href', '/products/prod-1/references')
  })

  it('archives via the confirmation dialog', async () => {
    let archived = false
    server.use(
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json(makeProduct({ status: 'ACTIVE' }))
      ),
      http.delete(apiUrl('/admin/products/prod-1'), () => {
        archived = true
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    renderDetail()
    await user.click(await screen.findByRole('button', { name: /archive/i }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /^archive$/i }))
    await waitFor(() => expect(archived).toBe(true))
  })

  it('does not show an archive button for an already-archived product', async () => {
    server.use(
      http.get(apiUrl('/admin/products/prod-1'), () =>
        HttpResponse.json(makeProduct({ status: 'ARCHIVED' }))
      )
    )
    renderDetail()
    await screen.findByRole('heading', { level: 1, name: 'Foundation X' })
    expect(screen.queryByRole('button', { name: /archive/i })).not.toBeInTheDocument()
  })
})
