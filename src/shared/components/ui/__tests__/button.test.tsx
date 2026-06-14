import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../button'

describe('Button', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>)
    const btn = screen.getByRole('button', { name: 'Outline' })
    expect(btn.className).toContain('border')
  })

  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const btn = screen.getByRole('button', { name: 'Delete' })
    expect(btn.className).toContain('destructive')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(
      <Button
        onClick={() => {
          clicked = true
        }}
      >
        Click
      </Button>
    )
    await user.click(screen.getByRole('button', { name: 'Click' }))
    expect(clicked).toBe(true)
  })
})
