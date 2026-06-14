import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { NotFoundPage } from '../NotFoundPage'

describe('NotFoundPage', () => {
  it('renders the 404 heading', () => {
    render(<NotFoundPage />)
    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument()
  })

  it('shows a page not found message', () => {
    render(<NotFoundPage />)
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })

  it('renders a link back to home', () => {
    render(<NotFoundPage />)
    const link = screen.getByRole('link', { name: 'Back to Home' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
