import { describe, it, expect } from 'vitest'
import { http, HttpResponse } from 'msw'
import { Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@/test/utils/render'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { ProductFormPage } from '../ProductFormPage'
import { makeProduct, selectOptionHandlers } from '@/features/products/__tests__/fixtures'

function renderCreate(role: 'OWNER' | 'STAFF' = 'OWNER') {
  return render(
    <Routes>
      <Route path="/products/new" element={<ProductFormPage />} />
      <Route path="/products" element={<div>Products list</div>} />
    </Routes>,
    { initialEntries: ['/products/new'], role }
  )
}

describe('ProductFormPage (create)', () => {
  it('renders the create form with category and brand options loaded', async () => {
    server.use(...selectOptionHandlers())
    renderCreate()
    expect(
      await screen.findByRole('heading', { level: 1, name: 'New product' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    // Categories/brands fetched without error → selects are enabled.
    await waitFor(() =>
      expect(screen.getByLabelText(/category/i)).not.toHaveAttribute('data-disabled')
    )
  })

  it('blocks STAFF with a forbidden message', () => {
    server.use(...selectOptionHandlers())
    renderCreate('STAFF')
    expect(screen.getByText(/do not have permission/i)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'New product' })).not.toBeInTheDocument()
  })

  it('shows required-field validation', async () => {
    server.use(...selectOptionHandlers())
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New product' })

    // Clear name (defaults empty) and submit
    await user.click(screen.getByRole('button', { name: /create product/i }))
    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(screen.getByText('Category is required')).toBeInTheDocument()
  })

  it('submits a correct create request and redirects on success', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      ...selectOptionHandlers(),
      http.post(apiUrl('/admin/products'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json(makeProduct({ id: 'new-1' }))
      })
    )
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New product' })

    await user.type(screen.getByLabelText(/name/i), 'Serum Pro')
    // Blur name → slug auto-fills to a kebab-case value.
    await user.click(screen.getByLabelText(/category/i))
    await user.click(await screen.findByRole('option', { name: 'Face' }))
    await waitFor(() => expect(screen.getByLabelText(/^slug/i)).toHaveValue('serum-pro'))
    await user.click(screen.getByRole('button', { name: /create product/i }))

    await waitFor(() => expect(body).toBeDefined())
    expect(body).toMatchObject({
      name: 'Serum Pro',
      slug: 'serum-pro',
      categoryId: 'cat-1',
      currency: 'MAD',
    })
    expect(await screen.findByText('Products list')).toBeInTheDocument()
  })

  it('prevents duplicate submission while a request is in flight', async () => {
    let calls = 0
    let release: () => void = () => {}
    server.use(
      ...selectOptionHandlers(),
      http.post(apiUrl('/admin/products'), async () => {
        calls += 1
        await new Promise<void>((r) => (release = r))
        return HttpResponse.json(makeProduct())
      })
    )
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New product' })
    await user.type(screen.getByLabelText(/name/i), 'Serum')
    await user.type(screen.getByLabelText(/^slug/i), 'serum')
    await user.click(screen.getByLabelText(/category/i))
    await user.click(await screen.findByRole('option', { name: 'Face' }))

    const submit = screen.getByRole('button', { name: /create product/i })
    await user.click(submit)
    // While the request is in flight the submit button is disabled, so a second
    // click cannot fire another request.
    await waitFor(() => expect(submit).toBeDisabled())
    await user.click(submit).catch(() => {})
    expect(calls).toBe(1)
    release()
    await waitFor(() => expect(screen.getByText('Products list')).toBeInTheDocument())
  })

  it('surfaces backend validation errors via feedback', async () => {
    server.use(
      ...selectOptionHandlers(),
      http.post(apiUrl('/admin/products'), () =>
        HttpResponse.json({ statusCode: 409, message: 'Slug already exists' }, { status: 409 })
      )
    )
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New product' })
    await user.type(screen.getByLabelText(/name/i), 'Dup')
    await user.type(screen.getByLabelText(/^slug/i), 'dup')
    await user.click(screen.getByLabelText(/category/i))
    await user.click(await screen.findByRole('option', { name: 'Face' }))
    await user.click(screen.getByRole('button', { name: /create product/i }))

    expect(await screen.findByText('Create failed')).toBeInTheDocument()
    // Stays on the form rather than redirecting.
    expect(screen.queryByText('Products list')).not.toBeInTheDocument()
  })

  it('cancel navigates back to the list', async () => {
    server.use(...selectOptionHandlers())
    const user = userEvent.setup()
    renderCreate()
    await screen.findByRole('heading', { name: 'New product' })
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(await screen.findByText('Products list')).toBeInTheDocument()
  })
})
