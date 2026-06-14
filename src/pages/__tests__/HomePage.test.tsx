import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils/render'
import { HomePage } from '../HomePage'

describe('HomePage', () => {
  it('renders the app name heading', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { level: 1, name: 'Penguin Beauty Admin' })).toBeInTheDocument()
  })

  it('shows the foundation ready alert', () => {
    render(<HomePage />)
    expect(screen.getByText('Foundation Ready')).toBeInTheDocument()
  })

  it('lists the stack items', () => {
    render(<HomePage />)
    expect(screen.getByText('React + Vite')).toBeInTheDocument()
    expect(screen.getByText('TanStack Query v5')).toBeInTheDocument()
    expect(screen.getByText('Tailwind CSS v3')).toBeInTheDocument()
    expect(screen.getByText('shadcn/ui')).toBeInTheDocument()
  })

  it('shows environment values', () => {
    render(<HomePage />)
    expect(screen.getByText(/http:\/\/localhost:3000/)).toBeInTheDocument()
  })

  it('renders shadcn Button components', () => {
    render(<HomePage />)
    expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument()
  })
})
