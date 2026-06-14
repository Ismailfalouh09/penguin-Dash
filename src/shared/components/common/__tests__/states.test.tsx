import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from '../EmptyState'
import { ErrorState } from '../ErrorState'
import { LoadingState } from '../LoadingState'
import { StatusBadge } from '../StatusBadge'
import { ComingSoonState } from '../ComingSoonState'

describe('EmptyState', () => {
  it('renders title, description and optional action', () => {
    render(
      <EmptyState
        title="No products yet"
        description="Create one to get started"
        action={<button>Create</button>}
      />
    )
    expect(screen.getByText('No products yet')).toBeInTheDocument()
    expect(screen.getByText('Create one to get started')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })
})

describe('ErrorState', () => {
  it('renders a friendly message and is announced as an alert', () => {
    render(<ErrorState message="Could not load" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Could not load')).toBeInTheDocument()
  })

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()
    render(<ErrorState onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('omits the retry button when no handler is provided', () => {
    render(<ErrorState />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('LoadingState', () => {
  it('exposes a busy status to assistive tech', () => {
    render(<LoadingState variant="table" />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'true')
  })
})

describe('StatusBadge', () => {
  it('pairs color with a text label (never color-only)', () => {
    render(<StatusBadge tone="success">Active</StatusBadge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})

describe('ComingSoonState', () => {
  it('lists planned features and marks the module as not implemented', () => {
    render(
      <ComingSoonState
        description="Manage products"
        plannedFeatures={['List products', 'Create products']}
      />
    )
    expect(screen.getByText('Not yet implemented')).toBeInTheDocument()
    expect(screen.getByText('List products')).toBeInTheDocument()
    expect(screen.getByText('Create products')).toBeInTheDocument()
  })
})
