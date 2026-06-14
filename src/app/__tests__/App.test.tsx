import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { apiUrl } from '@/test/mocks/api'
import { renderWithRouter } from '@/test/utils/router'
import { routes } from '../router'

/**
 * Route integration tests against the real route configuration, exercised
 * through a memory data router.
 */
describe('application routes', () => {
  it('renders the dashboard overview at /dashboard', () => {
    renderWithRouter(routes, { initialEntries: ['/dashboard'] })
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument()
  })

  it('redirects the index route to the dashboard', () => {
    renderWithRouter(routes, { initialEntries: ['/'] })
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument()
  })

  it('renders the packs page', async () => {
    server.use(
      http.get(apiUrl('/admin/packs'), () =>
        HttpResponse.json({
          data: [],
          meta: {
            page: 1,
            pageSize: 20,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        })
      )
    )
    renderWithRouter(routes, { initialEntries: ['/packs'] })
    expect(screen.getByRole('heading', { level: 1, name: 'Packs' })).toBeInTheDocument()
    expect(await screen.findByText('No packs found')).toBeInTheDocument()
  })

  it('resolves a nested dynamic product route', async () => {
    server.use(
      http.get(apiUrl('/admin/products/prod-123'), () =>
        HttpResponse.json({ statusCode: 500, message: 'fail' }, { status: 500 })
      )
    )
    renderWithRouter(routes, { initialEntries: ['/products/prod-123'] })
    // The real detail page loads asynchronously; with no API handler it lands
    // on a safe error state rather than throwing.
    expect(await screen.findByText('Could not load product details.')).toBeInTheDocument()
  })

  it('renders the forbidden page', () => {
    renderWithRouter(routes, { initialEntries: ['/forbidden'] })
    expect(screen.getByRole('heading', { level: 1, name: 'Access denied' })).toBeInTheDocument()
  })

  it('renders the not-found page for unknown routes (inside the shell)', () => {
    renderWithRouter(routes, { initialEntries: ['/does-not-exist'] })
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
    // Shell navigation is preserved on 404.
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })

  it('renders the standalone login page without the shell', () => {
    renderWithRouter(routes, { initialEntries: ['/login'], unauthenticated: true })
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText('Access the Penguin Beauty admin dashboard.')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
  })
})
