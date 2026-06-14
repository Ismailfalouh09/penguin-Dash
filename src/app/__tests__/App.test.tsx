import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
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

  it('renders a catalog placeholder page', () => {
    renderWithRouter(routes, { initialEntries: ['/categories'] })
    expect(screen.getByRole('heading', { level: 1, name: 'Categories' })).toBeInTheDocument()
    expect(screen.getByText('Not yet implemented')).toBeInTheDocument()
  })

  it('resolves a nested dynamic route and shows the param', () => {
    renderWithRouter(routes, { initialEntries: ['/products/prod-123'] })
    expect(screen.getByRole('heading', { level: 1, name: 'Product details' })).toBeInTheDocument()
    expect(screen.getByText('prod-123')).toBeInTheDocument()
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

  it('renders the standalone login placeholder without the shell', () => {
    renderWithRouter(routes, { initialEntries: ['/login'] })
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByText('Design preview')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Main navigation' })).not.toBeInTheDocument()
  })
})
