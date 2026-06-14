import { describe, it, expect, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@/test/utils/render'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { ProductsPage } from '../ProductsPage'
import { makeProduct, makeProductPage } from '@/features/products/__tests__/fixtures'

/** Capture the query string of the most recent list request. */
function listHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any = makeProductPage([makeProduct()]),
  onRequest?: (url: URL) => void
) {
  return http.get(apiUrl('/admin/products'), ({ request }) => {
    onRequest?.(new URL(request.url))
    return HttpResponse.json(body)
  })
}

describe('ProductsPage list', () => {
  beforeEach(() => {
    server.use(listHandler())
  })

  it('loads and displays product rows with expected fields', async () => {
    server.use(
      listHandler(
        makeProductPage([
          makeProduct({ id: 'p1', name: 'Foundation X', slug: 'foundation-x', basePrice: 199.99 }),
        ])
      )
    )
    render(<ProductsPage />, { initialEntries: ['/products'] })

    expect(await screen.findByText('Foundation X')).toBeInTheDocument()
    expect(screen.getByText('foundation-x')).toBeInTheDocument()
    expect(screen.getByText(/199\.99 MAD/)).toBeInTheDocument()
    // Category + brand columns
    expect(screen.getByText('Face')).toBeInTheDocument()
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('shows a loading state before data resolves', async () => {
    render(<ProductsPage />, { initialEntries: ['/products'] })
    // SkeletonTable renders a status region while loading.
    expect(document.querySelector('[aria-busy="true"], .animate-pulse')).toBeTruthy()
    await screen.findByText('Foundation X')
  })

  it('shows an empty state when there are no products', async () => {
    server.use(listHandler(makeProductPage([])))
    render(<ProductsPage />, { initialEntries: ['/products'] })
    expect(await screen.findByText('No products found')).toBeInTheDocument()
  })

  it('shows an error state and retries on demand', async () => {
    let calls = 0
    server.use(
      http.get(apiUrl('/admin/products'), () => {
        calls += 1
        if (calls === 1) {
          return HttpResponse.json({ statusCode: 500, message: 'fail' }, { status: 500 })
        }
        return HttpResponse.json(makeProductPage([makeProduct({ name: 'Recovered' })]))
      })
    )
    const user = userEvent.setup()
    render(<ProductsPage />, { initialEntries: ['/products'] })

    const retry = await screen.findByRole('button', { name: /retry|try again/i })
    await user.click(retry)
    expect(await screen.findByText('Recovered')).toBeInTheDocument()
  })

  it('sends search from the URL in the request', async () => {
    let seen: URL | undefined
    server.use(listHandler(makeProductPage([makeProduct()]), (url) => (seen = url)))
    render(<ProductsPage />, { initialEntries: ['/products?search=serum'] })

    await screen.findByText('Foundation X')
    await waitFor(() => expect(seen?.searchParams.get('search')).toBe('serum'))
  })

  it('updates the request when typing in the search box', async () => {
    let lastSearch: string | null = null
    server.use(
      listHandler(
        makeProductPage([makeProduct()]),
        (url) => (lastSearch = url.searchParams.get('search'))
      )
    )
    const user = userEvent.setup()
    render(<ProductsPage />, { initialEntries: ['/products'] })
    await screen.findByText('Foundation X')

    const search = screen.getByRole('searchbox', { name: /search products/i })
    await user.type(search, 'lipstick')

    // The debounced value reaches the request params (and thus the URL state).
    await waitFor(() => expect(lastSearch).toBe('lipstick'))
  })

  it('passes pagination params from the URL', async () => {
    let seen: URL | undefined
    server.use(
      listHandler(makeProductPage([makeProduct()], { totalItems: 50 }), (url) => (seen = url))
    )
    render(<ProductsPage />, { initialEntries: ['/products?page=2&limit=10'] })

    await screen.findByText('Foundation X')
    await waitFor(() => {
      expect(seen?.searchParams.get('page')).toBe('2')
      expect(seen?.searchParams.get('pageSize')).toBe('10')
    })
  })

  it('applies the status filter from the URL', async () => {
    let seen: URL | undefined
    server.use(listHandler(makeProductPage([makeProduct()]), (url) => (seen = url)))
    render(<ProductsPage />, { initialEntries: ['/products?status=ARCHIVED'] })

    await screen.findByText('Foundation X')
    await waitFor(() => expect(seen?.searchParams.get('status')).toBe('ARCHIVED'))
  })

  it('applies the isActive filter from the URL', async () => {
    let seen: URL | undefined
    server.use(listHandler(makeProductPage([makeProduct()]), (url) => (seen = url)))
    render(<ProductsPage />, { initialEntries: ['/products?isActive=false'] })

    await screen.findByText('Foundation X')
    await waitFor(() => expect(seen?.searchParams.get('isActive')).toBe('false'))
  })

  it('applies sort params from the URL', async () => {
    let seen: URL | undefined
    server.use(listHandler(makeProductPage([makeProduct()]), (url) => (seen = url)))
    render(<ProductsPage />, { initialEntries: ['/products?sortBy=name&sortOrder=asc'] })

    await screen.findByText('Foundation X')
    await waitFor(() => {
      expect(seen?.searchParams.get('sortBy')).toBe('name')
      expect(seen?.searchParams.get('sortOrder')).toBe('asc')
    })
  })

  it('falls back safely for invalid URL values', async () => {
    let seen: URL | undefined
    server.use(listHandler(makeProductPage([makeProduct()]), (url) => (seen = url)))
    render(<ProductsPage />, {
      initialEntries: ['/products?page=abc&limit=9999&sortOrder=sideways'],
    })

    await screen.findByText('Foundation X')
    await waitFor(() => {
      // page defaults to 1, an out-of-range limit is rejected, invalid sortOrder dropped
      expect(seen?.searchParams.get('page')).toBe('1')
      expect(seen?.searchParams.get('pageSize')).not.toBe('9999')
      expect(['asc', 'desc', null]).toContain(seen?.searchParams.get('sortOrder'))
    })
  })

  it('shows write actions for OWNER but not STAFF', async () => {
    render(<ProductsPage />, { initialEntries: ['/products'], role: 'OWNER' })
    expect(await screen.findByRole('link', { name: /new product/i })).toBeInTheDocument()
  })

  it('hides write actions for STAFF', async () => {
    render(<ProductsPage />, { initialEntries: ['/products'], role: 'STAFF' })
    await screen.findByText('Foundation X')
    expect(screen.queryByRole('link', { name: /new product/i })).not.toBeInTheDocument()
  })

  it('exposes accessible row actions', async () => {
    server.use(listHandler(makeProductPage([makeProduct({ name: 'Foundation X' })])))
    render(<ProductsPage />, { initialEntries: ['/products'], role: 'OWNER' })
    const row = await screen.findByText('Foundation X')
    expect(row).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /actions for foundation x/i })).toBeInTheDocument()
  })

  it('opens the archive confirmation and calls the archive endpoint on confirm', async () => {
    let archived = false
    server.use(
      listHandler(makeProductPage([makeProduct({ id: 'p1', name: 'Foundation X' })])),
      http.delete(apiUrl('/admin/products/p1'), () => {
        archived = true
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    render(<ProductsPage />, { initialEntries: ['/products'], role: 'OWNER' })

    await user.click(await screen.findByRole('button', { name: /actions for foundation x/i }))
    await user.click(await screen.findByRole('menuitem', { name: /archive/i }))

    const dialog = await screen.findByRole('alertdialog')
    expect(within(dialog).getByText(/will be archived/i)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: /^archive$/i }))

    await waitFor(() => expect(archived).toBe(true))
  })

  it('archive confirmation cancel does not call the API', async () => {
    let archived = false
    server.use(
      listHandler(makeProductPage([makeProduct({ id: 'p1', name: 'Foundation X' })])),
      http.delete(apiUrl('/admin/products/p1'), () => {
        archived = true
        return HttpResponse.json({})
      })
    )
    const user = userEvent.setup()
    render(<ProductsPage />, { initialEntries: ['/products'], role: 'OWNER' })

    await user.click(await screen.findByRole('button', { name: /actions for foundation x/i }))
    await user.click(await screen.findByRole('menuitem', { name: /archive/i }))
    const dialog = await screen.findByRole('alertdialog')
    await user.click(within(dialog).getByRole('button', { name: /cancel/i }))

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument())
    expect(archived).toBe(false)
  })
})
