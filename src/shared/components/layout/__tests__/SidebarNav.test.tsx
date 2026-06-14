import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { SidebarNav } from '../SidebarNav'

describe('SidebarNav', () => {
  it('renders the navigation groups and their items', () => {
    render(<SidebarNav />)
    // Group headings
    expect(screen.getByText('Catalog')).toBeInTheDocument()
    expect(screen.getByText('Personalization')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
    // Representative items
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument()
  })

  it('points each link at its configured route', () => {
    render(<SidebarNav />)
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products')
    expect(screen.getByRole('link', { name: 'Media library' })).toHaveAttribute('href', '/media')
  })

  it('marks the active route', () => {
    render(<SidebarNav />, { initialEntries: ['/products'] })
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page')
  })

  it('exposes an accessible navigation landmark', () => {
    render(<SidebarNav />)
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
  })
})
