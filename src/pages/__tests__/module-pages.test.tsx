import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { DashboardOverviewPage } from '../DashboardOverviewPage'

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
