import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { ProductsPage } from '../catalog/ProductsPage'
import { DashboardOverviewPage } from '../DashboardOverviewPage'

describe('module placeholder pages', () => {
  it('renders the page title and planned-module notice', () => {
    render(<ProductsPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Products' })).toBeInTheDocument()
    expect(screen.getByText('Not yet implemented')).toBeInTheDocument()
  })

  it('shows the write action for OWNER', () => {
    render(<ProductsPage />, { role: 'OWNER' })
    expect(screen.getByRole('button', { name: /new product/i })).toBeInTheDocument()
  })

  it('hides the write action for STAFF', () => {
    render(<ProductsPage />, { role: 'STAFF' })
    expect(screen.queryByRole('button', { name: /new product/i })).not.toBeInTheDocument()
  })

  it('exposes the reusable list-state previews', () => {
    render(<ProductsPage />)
    expect(screen.getByRole('tab', { name: 'Loading' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Empty' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Error' })).toBeInTheDocument()
  })
})

describe('DashboardOverviewPage', () => {
  it('renders the overview with quick actions and no invented metrics', () => {
    render(<DashboardOverviewPage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByText('Quick actions')).toBeInTheDocument()
    // Metric placeholders show a dash, never a fabricated number.
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('marks planned sections clearly', () => {
    render(<DashboardOverviewPage />)
    expect(screen.getByText('No order data yet')).toBeInTheDocument()
  })
})
