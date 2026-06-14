import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { NotFoundPage } from '../NotFoundPage'
import { ForbiddenPage } from '../ForbiddenPage'

describe('NotFoundPage', () => {
  it('renders the not-found heading and a link back to the dashboard', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: 'Back to dashboard' })
    expect(link).toHaveAttribute('href', '/dashboard')
  })
})

describe('ForbiddenPage', () => {
  it('explains the lack of permission and links back to the dashboard', () => {
    render(<ForbiddenPage />)
    expect(screen.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument()
    expect(screen.getByText(/don.t have permission/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to dashboard' })).toHaveAttribute(
      'href',
      '/dashboard'
    )
  })
})
